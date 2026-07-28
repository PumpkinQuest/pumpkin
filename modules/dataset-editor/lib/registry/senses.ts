// ---------------------------------------------------------------------------
// Senses — the one documented exception where a `trait`'s `params` legitimately
// rides alongside a `description` (dataset-editor-guide.md §5.5): darkvision &
// co. get their own text block where the largest distance among sources wins.
// Every other `params` key is dead data nobody reads, so the visual editor only
// ever exposes `params` through this closed list — never a generic "numeric
// trait parameter" field.
// ---------------------------------------------------------------------------

export const SENSE_TRAIT_IDS = ['darkvision', 'blindsight', 'tremorsense', 'truesight'] as const;
export type SenseTraitId = typeof SENSE_TRAIT_IDS[number];

export const SENSE_LABELS: Record<SenseTraitId, string> = {
    darkvision: 'Тёмное зрение',
    blindsight: 'Слепое зрение',
    tremorsense: 'Чувство вибрации',
    truesight: 'Истинное зрение',
};

export function isSenseTraitId(id: string): id is SenseTraitId {
    return (SENSE_TRAIT_IDS as readonly string[]).includes(id);
}
