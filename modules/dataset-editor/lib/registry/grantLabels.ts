import type { Grant } from "../types";

// ---------------------------------------------------------------------------
// Russian captions for the 26 grant types. Lives here rather than in GrantList
// so the grant editor's header can name the type it is editing (it used to
// print the raw `asi-flexible`-style key) without importing its own parent.
// ---------------------------------------------------------------------------

export const GRANT_TYPE_LABELS: Record<Grant['type'], string> = {
    'asi-fixed': 'Характеристики (фикс)',
    'asi-flexible': 'Характеристики (выбор)',
    'asi-pool': 'Характеристики (пул)',
    'bonus': 'Бонус',
    'feat': 'Черта',
    'skill-fixed': 'Навыки (фикс)',
    'skill-choice': 'Навыки (выбор)',
    'expertise-choice': 'Экспертиза (выбор)',
    'tool-fixed': 'Инструменты (фикс)',
    'tool-choice': 'Инструменты (выбор)',
    'language-fixed': 'Языки (фикс)',
    'language-choice': 'Языки (выбор)',
    'speed': 'Скорость',
    'saving-throw': 'Спасбросок',
    'trait': 'Особенность',
    'armor-prof': 'Владение бронёй',
    'weapon-prof': 'Владение оружием',
    'spellcasting': 'Заклинания',
    'spell-fixed': 'Заклинание (именное)',
    'spell-choice': 'Заклинания (выбор)',
    'hp-die': 'Кость хитов',
    'size': 'Размер',
    'resource': 'Ресурс',
    'equipment-fixed': 'Снаряжение (фикс)',
    'equipment-choice': 'Снаряжение (выбор)',
    'gold': 'Золото',
    'gold-dice': 'Золото (кубы)',
    'pick-one': 'Выбор одного',
};

export const GRANT_TYPES = Object.keys(GRANT_TYPE_LABELS) as Array<Grant['type']>;

export function grantTypeLabel(type: string): string {
    return GRANT_TYPE_LABELS[type as Grant['type']] ?? type;
}
