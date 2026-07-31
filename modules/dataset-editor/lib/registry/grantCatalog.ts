import type { Grant } from "../types";
import { generateGrantId } from "../ids";
import { GRANT_TYPE_LABELS } from "./grantLabels";
import { SENSE_LABELS } from "./senses";

// ---------------------------------------------------------------------------
// Grant picker catalog — the "add grant" list seen from the author's intent
// rather than from the format's type table (dataset-editor-ux.md §D).
//
// Three things live here that the flat 25-type grid didn't have:
//   * groups by meaning, so «что-то про владения» is one place to look;
//   * a one-line «что это сделает на листе» under every entry;
//   * synonyms, so «дарквижн» or «ярость» find the right entry — the author
//     types the word from their homebrew, not the word from the format.
//
// Entries are not strictly 1:1 with grant types: a preset produces a
// preconfigured grant (a sense), and `create` returns a list, so an entry may
// hand back more than one grant at a time.
// ---------------------------------------------------------------------------

export type GrantGroupId =
    | 'stats' | 'proficiency' | 'abilities' | 'combat' | 'class' | 'start' | 'fork';

export const GRANT_GROUPS: Array<{ id: GrantGroupId; label: string }> = [
    { id: 'stats', label: 'Характеристики' },
    { id: 'proficiency', label: 'Владения' },
    { id: 'abilities', label: 'Способности' },
    { id: 'combat', label: 'Прочие бонусы' },
    { id: 'class', label: 'Класс' },
    { id: 'start', label: 'Старт персонажа' },
    { id: 'fork', label: 'Развилки' },
];

export type GrantCreateContext = {
    /** Every `trait` grant of the entity — lets `resource` prefill its pairing. */
    siblingTraits: Array<{ id: string; name: string }>;
};

export type GrantPickerEntry = {
    /** Stable key: the grant type for plain entries, a `preset-*` slug otherwise. */
    id: string;
    label: string;
    /** One line of «что это сделает на листе», shown under the label. */
    hint: string;
    group: GrantGroupId;
    /** Words an author might type instead of the formal name. */
    keywords: string[];
    /** Plain entries carry their type — its formal caption joins the search haystack. */
    type?: Grant['type'];
    create: (ctx: GrantCreateContext) => Grant[];
};

// ── Default grant bodies ──────────────────────────────────────────────────

/**
 * A blank-but-valid grant of the given type. Defaults are chosen to be either
 * obviously unfinished (empty lists the author must fill) or the overwhelmingly
 * common value (speed 30, d8 hit die) — never a plausible-looking wrong number.
 */
export function makeDefaultGrant(type: string, siblingTraits: Array<{ id: string; name: string }>): Grant {
    switch (type) {
        case 'resource': {
            // Prefill from the entity's traits per dataset-editor-guide.md §5.8
            // point 4: a blank "which trait does this belong to" is a silent
            // wrong-placement default, not a neutral one. Exactly one sibling
            // trait → assume it's the one being paired; otherwise leave the id
            // blank and let the author pick explicitly in the form.
            if (siblingTraits.length === 1) {
                return { type: 'resource', id: siblingTraits[0].id, name: siblingTraits[0].name };
            }
            return { type: 'resource', id: '', name: '' };
        }
        case 'asi-fixed': return { type: 'asi-fixed', values: {} };
        case 'asi-flexible': return { type: 'asi-flexible', sets: [] };
        case 'asi-pool': return { type: 'asi-pool', total: 3, max: 2, options: [] };
        case 'bonus': return { type: 'bonus', target: '', value: 0, label: '' };
        case 'feat': return { type: 'feat', featId: '' };
        case 'skill-fixed': return { type: 'skill-fixed', skills: [] };
        case 'skill-choice': return { type: 'skill-choice', count: 1, options: 'any' };
        case 'expertise-choice': return { type: 'expertise-choice', count: 1 };
        case 'tool-fixed': return { type: 'tool-fixed', tools: [] };
        case 'tool-choice': return { type: 'tool-choice', count: 1, options: [] };
        case 'language-fixed': return { type: 'language-fixed', languages: [] };
        case 'language-choice': return { type: 'language-choice', count: 1 };
        case 'speed': return { type: 'speed', value: 30 };
        case 'saving-throw': return { type: 'saving-throw', stats: [] };
        case 'trait': return { type: 'trait', id: generateGrantId(), name: '', description: '' };
        case 'armor-prof': return { type: 'armor-prof', armors: [] };
        case 'weapon-prof': return { type: 'weapon-prof', weapons: [] };
        case 'spellcasting': return { type: 'spellcasting', ability: 'int', casterType: 'list' };
        case 'hp-die': return { type: 'hp-die', die: 8 };
        case 'size': return { type: 'size', value: 'medium' };
        case 'equipment-fixed': return { type: 'equipment-fixed', items: [] };
        case 'equipment-choice': return { type: 'equipment-choice', options: [] };
        case 'gold': return { type: 'gold', amount: 0 };
        case 'gold-dice': return { type: 'gold-dice', dice: '5d4' };
        case 'pick-one': return { type: 'pick-one', options: [] };
        default: return { type: 'bonus', target: '', value: 0, label: '' } as Grant;
    }
}

function plain<T extends Grant['type']>(
    type: T,
    group: GrantGroupId,
    label: string,
    hint: string,
    keywords: string[],
): GrantPickerEntry & { type: T } {
    return {
        id: type,
        type,
        group,
        label,
        hint,
        keywords,
        create: ({ siblingTraits }) => [makeDefaultGrant(type, siblingTraits)],
    };
}

// ── Catalog ───────────────────────────────────────────────────────────────

/** One entry per grant type — the completeness check below depends on it. */
const PLAIN_ENTRIES = [
    // Характеристики
    plain('asi-fixed', 'stats', 'Фиксированный бонус',
        'Прибавит заданные числа к характеристикам — например СИЛ +2, ТЕЛ +1.',
        ['сила', 'ловкость', 'телосложение', 'интеллект', 'мудрость', 'харизма', 'asi', 'стат', 'stat']),
    plain('asi-flexible', 'stats', 'Выбор игрока',
        'Игрок сам разложит прибавки по характеристикам — «+2 к одной и +1 к другой».',
        ['asi', 'гибкий', 'распределить', 'на выбор', 'плавающий']),
    plain('asi-pool', 'stats', 'Пул очков',
        'Даст пул очков, который игрок раскидает сам, не больше N в одну характеристику.',
        ['очки', 'пул', 'распределение', 'point buy', 'поинты']),

    // Владения
    plain('skill-fixed', 'proficiency', 'Навыки',
        'Отметит владение конкретными навыками — бонус мастерства пойдёт в их проверки.',
        ['скилл', 'атлетика', 'скрытность', 'восприятие', 'владение навыком', 'профа']),
    plain('skill-choice', 'proficiency', 'Навыки на выбор',
        'Игрок выберет N навыков — из всех или из вашего списка.',
        ['скилл', 'выбор навыка', 'два навыка', 'на выбор']),
    plain('expertise-choice', 'proficiency', 'Экспертиза',
        'Удвоит бонус мастерства у выбранных навыков — только у тех, которыми персонаж уже владеет.',
        ['expertise', 'удвоение', 'компетентность', 'вдвое']),
    plain('tool-fixed', 'proficiency', 'Инструменты',
        'Добавит инструменты в текстовый блок владений на листе.',
        ['ремесло', 'воровские инструменты', 'набор', 'tools', 'инструментарий']),
    plain('tool-choice', 'proficiency', 'Инструменты на выбор',
        'Игрок выберет N инструментов из перечисленных вами.',
        ['ремесло', 'tools', 'на выбор']),
    plain('language-fixed', 'proficiency', 'Языки',
        'Добавит языки в блок «Языки».',
        ['язык', 'эльфийский', 'общий', 'орочий', 'languages', 'речь']),
    plain('language-choice', 'proficiency', 'Языки на выбор',
        'Игрок выберет N языков — любых или из вашего списка.',
        ['язык', 'languages', 'на выбор']),
    plain('weapon-prof', 'proficiency', 'Оружие',
        'Отметит владение категориями оружия и отдельными видами (длинный меч, короткий лук).',
        ['меч', 'лук', 'воинское', 'простое', 'weapon', 'владение оружием']),
    plain('armor-prof', 'proficiency', 'Броня',
        'Отметит владение категориями брони и щитами.',
        ['доспех', 'щит', 'лёгкая', 'средняя', 'тяжёлая', 'armor', 'латы']),
    plain('saving-throw', 'proficiency', 'Спасброски',
        'Отметит владение спасбросками по выбранным характеристикам.',
        ['спас', 'сейв', 'saving throw', 'спасбросок']),

    // Способности
    plain('trait', 'abilities', 'Описание способности',
        'Сворачиваемый спойлер на листе: название и описание. Кости и Сл внутри пишутся формулой [f:...].',
        ['особенность', 'умение', 'фича', 'текст', 'описание', 'trait', 'способность']),
    plain('resource', 'abilities', 'Ресурс',
        'Счётчик с делениями — «Ярость 3/3», восстановление на коротком или длинном отдыхе.',
        ['ресурс', 'заряды', 'ярость', 'использования', 'раз в день', 'очки', 'pool']),

    // Прочие бонусы
    plain('speed', 'combat', 'Скорость',
        'Задаст базовую скорость ходьбы в футах.',
        ['ходьба', 'футы', '30', 'быстрый', 'speed', 'передвижение']),
    plain('size', 'combat', 'Размер',
        'Задаст размерную категорию персонажа — маленький, средний или большой. Для развилки размера положите два таких гранта в разные варианты pick-one.',
        ['размер', 'маленький', 'средний', 'большой', 'size', 'категория размера']),
    plain('bonus', 'combat', 'Бонус к чему-либо',
        'Прибавит число к готовому показателю листа — КД, инициативе, хитам, урону.',
        ['кд', 'ac', 'класс доспеха', 'инициатива', 'урон', 'хиты', 'модификатор', 'прибавка']),

    // Класс
    plain('hp-die', 'class', 'Кость хитов',
        'Задаст кость хитов класса (d6…d12) — из неё считаются максимум хитов и лечение на отдыхе.',
        ['хиты', 'здоровье', 'd8', 'хд', 'hit die', 'кубик здоровья']),
    plain('spellcasting', 'class', 'Заклинания',
        'Включит колдовство: базовая характеристика, тип заклинателя и прогрессия ячеек.',
        ['магия', 'каст', 'спелл', 'ячейки', 'spellcasting', 'колдовство', 'заклинатель']),

    // Старт персонажа
    plain('equipment-fixed', 'start', 'Снаряжение',
        'Положит предметы в стартовое снаряжение персонажа.',
        ['экипировка', 'предметы', 'инвентарь', 'стартовое', 'вещи']),
    plain('equipment-choice', 'start', 'Снаряжение на выбор',
        'Игрок выберет один из наборов стартового снаряжения.',
        ['экипировка', 'набор', 'вариант', 'предметы']),
    plain('gold', 'start', 'Золото',
        'Добавит стартовое золото фиксированной суммой.',
        ['деньги', 'зм', 'gp', 'монеты', 'gold']),
    plain('gold-dice', 'start', 'Золото броском кубов',
        'Стартовое золото формулой — например 5d4*10.',
        ['деньги', 'зм', 'кубы', 'бросок', '5d4']),
    plain('feat', 'start', 'Черта',
        'Выдаст черту из датасета — или откроет игроку выбор любой черты.',
        ['фит', 'feat', 'талант', 'происхождение', 'origin']),

    // Развилки
    plain('pick-one', 'fork', 'Выбор одного из вариантов',
        'Развилка: игрок берёт один вариант и получает только его гранты.',
        ['выбор', 'развилка', 'вариант', 'или', 'pick one', 'ветка']),
];

/**
 * Compile-time completeness: the picker no longer enumerates the type table, so
 * a grant type added to `Grant` without a `PLAIN_ENTRIES` line would silently
 * become unreachable in the UI. This line goes red instead.
 */
const _everyGrantTypeIsInTheCatalog: Record<Grant['type'], true> = Object.fromEntries(
    PLAIN_ENTRIES.map((entry) => [entry.type, true]),
) as Record<typeof PLAIN_ENTRIES[number]['type'], true>;
void _everyGrantTypeIsInTheCatalog;

/** Preconfigured single grants — a type whose blank form hides what it's for. */
const PRESET_ENTRIES: GrantPickerEntry[] = [
    {
        id: 'preset-darkvision',
        group: 'abilities',
        label: 'Чувство: тёмное зрение',
        hint: 'Отдельный блок «Чувства» на листе; при нескольких источниках побеждает большая дистанция.',
        keywords: [
            'темновидение', 'дарквижн', 'darkvision', 'ночное зрение', 'чувство',
            'слепое зрение', 'истинное зрение', 'чувство вибрации', 'видит в темноте',
        ],
        create: () => [{
            type: 'trait',
            id: 'darkvision',
            name: SENSE_LABELS.darkvision,
            params: { range: 60 },
        }],
    },
];

export const GRANT_PICKER_ENTRIES: GrantPickerEntry[] = [...PLAIN_ENTRIES, ...PRESET_ENTRIES];

// ── Search ────────────────────────────────────────────────────────────────

/** Lowercase and fold `ё`, so «тёмное» and «темное» are the same query. */
function normalize(text: string): string {
    return text.toLowerCase().replace(/ё/g, 'е');
}

// Crude Russian stemming — an author types «кубами», «навыками», «золотом»,
// and the catalog stores «кубы», «навыки», «золото». Cutting the case ending
// off both sides makes those meet. Over-stemming just widens the result list a
// little, which in a picker is far cheaper than a miss. Endings are ordered
// longest-first so «ами» wins over «и».
const ENDINGS = [
    'ами', 'ями', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими',
    'ов', 'ей', 'ах', 'ях', 'ам', 'ям', 'ом', 'ем', 'ый', 'ий', 'ой', 'ая', 'ое', 'ые', 'ие',
    'а', 'я', 'ы', 'и', 'е', 'у', 'ю', 'о',
];

function stem(word: string): string {
    for (const ending of ENDINGS) {
        if (word.endsWith(ending) && word.length - ending.length >= 3) {
            return word.slice(0, -ending.length);
        }
    }
    return word;
}

type Haystack = { raw: string; stems: string[] };

const HAYSTACKS = new Map<string, Haystack>(
    GRANT_PICKER_ENTRIES.map((entry) => {
        const raw = normalize([
            entry.label,
            ...entry.keywords,
            entry.id,
            entry.type ? GRANT_TYPE_LABELS[entry.type] : '',
        ].join(' '));
        return [entry.id, { raw, stems: raw.split(/[^a-zа-я0-9+]+/).filter(Boolean).map(stem) }];
    }),
);

/** Every whitespace-separated token must match somewhere in the entry. */
export function searchGrantEntries(query: string): GrantPickerEntry[] {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return GRANT_PICKER_ENTRIES;
    return GRANT_PICKER_ENTRIES.filter((entry) => {
        const haystack = HAYSTACKS.get(entry.id);
        if (!haystack) return false;
        return tokens.every((token) => {
            // Substring first — it covers partial typing («заклин», «dark»).
            if (haystack.raw.includes(token)) return true;
            // Prefix match either way: the crude stemmer cuts «зрение» to
            // «зрен» but «зрения» only to «зрени», and those still mean the
            // same word.
            const tokenStem = stem(token);
            return haystack.stems.some((word) => (
                word.startsWith(tokenStem) || (word.length >= 4 && tokenStem.startsWith(word))
            ));
        });
    });
}

/** Entries bucketed into `GRANT_GROUPS` order; empty groups are dropped. */
export function groupGrantEntries(
    entries: GrantPickerEntry[],
): Array<{ id: GrantGroupId; label: string; entries: GrantPickerEntry[] }> {
    return GRANT_GROUPS
        .map((group) => ({
            ...group,
            entries: entries.filter((entry) => entry.group === group.id),
        }))
        .filter((group) => group.entries.length > 0);
}
