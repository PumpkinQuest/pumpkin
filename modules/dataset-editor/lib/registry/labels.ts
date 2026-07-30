// ---------------------------------------------------------------------------
// Russian display labels for the closed key sets of the format.
//
// The keys themselves are the contract with the character sheet and must never
// change (dataset-editor-guide.md §5.4: `'sleight of hand'` with a space,
// `'armor-label'` meaning the shield). These maps exist so the author never has
// to read or type them — pickers show the Russian name, the key is what gets
// stored. Anything missing from a map falls back to the raw key.
// ---------------------------------------------------------------------------

import type { CasterProgression, FeatCategory } from "../types";

export const STAT_LABELS: Record<string, string> = {
    str: 'СИЛ', dex: 'ЛОВ', con: 'ТЕЛ', int: 'ИНТ', wis: 'МДР', cha: 'ХАР',
};

export const SKILL_LABELS: Record<string, string> = {
    'acrobatics': 'Акробатика',
    'animal handling': 'Уход за животными',
    'arcana': 'Магия',
    'athletics': 'Атлетика',
    'deception': 'Обман',
    'history': 'История',
    'insight': 'Проницательность',
    'intimidation': 'Запугивание',
    'investigation': 'Анализ',
    'medicine': 'Медицина',
    'nature': 'Природа',
    'perception': 'Восприятие',
    'performance': 'Выступление',
    'persuasion': 'Убеждение',
    'religion': 'Религия',
    'sleight of hand': 'Ловкость рук',
    'stealth': 'Скрытность',
    'survival': 'Выживание',
};

export const LANGUAGE_LABELS: Record<string, string> = {
    'common': 'Общий',
    'dwarvish': 'Дварфийский',
    'elvish': 'Эльфийский',
    'giant': 'Великаний',
    'gnomish': 'Гномий',
    'goblin': 'Гоблинский',
    'halfling': 'Полуросликов',
    'orc': 'Орочий',
    'abyssal': 'Язык Бездны',
    'celestial': 'Небесный',
    'draconic': 'Драконий',
    'deep speech': 'Глубинная речь',
    'infernal': 'Инфернальный',
    'primordial': 'Первичный',
    'sylvan': 'Сильван',
    'undercommon': 'Подземный',
};

export const ARMOR_PROF_LABELS: Record<string, string> = {
    'armor-light': 'Лёгкая броня',
    'armor-medium': 'Средняя броня',
    'armor-heavy': 'Тяжёлая броня',
    'armor-label': 'Щит',
};

export const WEAPON_PROF_LABELS: Record<string, string> = {
    'weapon-simple': 'Простое оружие',
    'weapon-martial': 'Воинское оружие',
    'weapon-other': 'Другое оружие',
};

export const FEAT_CATEGORY_LABELS: Record<FeatCategory, string> = {
    'origin': 'Происхождение',
    'general': 'Общая',
    'fighting-style': 'Боевой стиль',
    'epic-boon': 'Эпический дар',
    'invocation': 'Инвокация',
};

export const FEAT_CATEGORIES: FeatCategory[] = [
    'origin', 'general', 'fighting-style', 'epic-boon', 'invocation',
];

export const CASTER_TYPE_LABELS: Record<string, string> = {
    memory: 'по памяти',
    list: 'по списку',
    book: 'по книге',
};

export const CASTER_PROGRESSION_LABELS: Record<CasterProgression, string> = {
    full: 'полный',
    half: 'половинный',
    third: 'треть',
    pact: 'пакт',
};

export const CASTER_PROGRESSIONS: CasterProgression[] = ['full', 'half', 'third', 'pact'];

export const SIZE_LABELS: Record<string, string> = {
    small: 'Маленький',
    medium: 'Средний',
    large: 'Большой',
};

/** Looks a key up in a label map, falling back to the key itself. */
export function labelOf(map: Record<string, string>, key: string): string {
    return map[key] ?? key;
}

/** Joins a list of keys as their Russian labels. */
export function labelList(map: Record<string, string>, keys: string[]): string {
    return keys.map((k) => labelOf(map, k)).join(', ');
}
