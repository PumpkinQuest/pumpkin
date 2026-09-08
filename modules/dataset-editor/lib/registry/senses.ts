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

/**
 * Default distance a freshly picked sense starts at. Darkvision is the one with
 * a modal SRD value — every species that has it has 60 ft, the drow's 120 being
 * the lone override — so it can be prefilled honestly. The other three have no
 * such value, and a plausible-looking guess is worse than a blank: `0` reads as
 * obviously unfinished and `lintDataset` flags it until the author fills it in.
 */
export const SENSE_DEFAULT_RANGE: Record<SenseTraitId, number> = {
    darkvision: 60,
    blindsight: 0,
    tremorsense: 0,
    truesight: 0,
};

/**
 * Is this name just one of our own captions? Switching the sense type rewrites
 * the name — but only when the author hasn't typed their own, so the drow's
 * «Превосходное тёмное зрение» survives a range edit round-trip.
 */
export function isDefaultSenseName(name: string): boolean {
    return (Object.values(SENSE_LABELS) as string[]).includes(name);
}
