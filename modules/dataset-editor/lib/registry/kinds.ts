// ---------------------------------------------------------------------------
// Entity kinds — the single glossary for the six collections a dataset holds.
// Every screen (tabs, lists, extract, library cards) reads its wording from
// here: before this existed the same collection was called «Предыстории» in one
// panel and «Фоны» in another, «Черты» and «Фиты».
//
// Order follows dataset-editor-guide.md §7 (races/backgrounds/feats first):
// they are almost fully expressible in the grant vocabulary, while classes hit
// the expressive cliff (§2) and make the worst possible first tab.
// ---------------------------------------------------------------------------

export type EntityKind = 'races' | 'subraces' | 'backgrounds' | 'feats' | 'subclasses' | 'classes';

export const ENTITY_KINDS: EntityKind[] = [
    'races', 'subraces', 'backgrounds', 'feats', 'subclasses', 'classes',
];

/** Tab captions and section headings. */
export const KIND_LABELS: Record<EntityKind, string> = {
    races: 'Расы',
    subraces: 'Подрасы',
    backgrounds: 'Предыстории',
    feats: 'Черты',
    subclasses: 'Подклассы',
    classes: 'Классы',
};

/** Accusative singular — «Добавить {расу}». */
export const KIND_ACCUSATIVE: Record<EntityKind, string> = {
    races: 'расу',
    subraces: 'подрасу',
    backgrounds: 'предысторию',
    feats: 'черту',
    subclasses: 'подкласс',
    classes: 'класс',
};

/** Genitive plural — «{рас}: 4», «нет {рас}». */
export const KIND_GENITIVE_PLURAL: Record<EntityKind, string> = {
    races: 'рас',
    subraces: 'подрас',
    backgrounds: 'предысторий',
    feats: 'черт',
    subclasses: 'подклассов',
    classes: 'классов',
};
