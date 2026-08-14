import type { Dataset, MergeConflict, MergedDatasets, WithSource } from "./types";

/** Merge multiple datasets into one. Later datasets win on entity id collision. */
export function mergeDatasets(datasets: Dataset[]): MergedDatasets {
    const conflicts: MergeConflict[] = [];
    const seen = new Map<string, string>(); // qualifiedId → source

    function mergeList<T extends { id: string }>(kind: MergeConflict['kind'], list: T[]): WithSource<T>[] {
        const result: WithSource<T>[] = [];
        for (const item of list) {
            const prev = seen.get(item.id);
            if (prev) {
                conflicts.push({ kind, id: item.id, sources: [prev] });
            }
            seen.set(item.id, item.id);
            result.push({ ...item, source: item.id, qualifiedId: `${item.id}:${item.id}` } as unknown as WithSource<T>);
        }
        return result;
    }

    // Per-dataset merge with proper source tracking
    const mergedClasses: Map<string, { entity: WithSource<typeof datasets[0]['classes'] extends (infer T)[] | undefined ? T : never>; sourceId: string }> = new Map();
    const mergedSubclasses: Map<string, { entity: WithSource<typeof datasets[0]['subclasses'] extends (infer T)[] | undefined ? T : never>; sourceId: string }> = new Map();
    const mergedRaces: Map<string, { entity: WithSource<typeof datasets[0]['races'] extends (infer T)[] | undefined ? T : never>; sourceId: string }> = new Map();
    const mergedSubraces: Map<string, { entity: WithSource<typeof datasets[0]['subraces'] extends (infer T)[] | undefined ? T : never>; sourceId: string }> = new Map();
    const mergedBackgrounds: Map<string, { entity: WithSource<typeof datasets[0]['backgrounds'] extends (infer T)[] | undefined ? T : never>; sourceId: string }> = new Map();
    const mergedFeats: Map<string, { entity: WithSource<typeof datasets[0]['feats'] extends (infer T)[] | undefined ? T : never>; sourceId: string }> = new Map();

    const conflictSources: Map<string, string[]> = new Map();

    for (const ds of datasets) {
        for (const k of ['classes', 'subclasses', 'races', 'subraces', 'backgrounds', 'feats'] as const) {
            const collection = ds[k];
            if (!collection) continue;
            for (const entity of collection) {
                const qualifiedId = `${ds.id}:${entity.id}`;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const sourceEntity: any = { ...entity, source: ds.id, qualifiedId };

                // Handle id collisions: later datasets overwrite, record the conflict
                const map = k === 'classes' ? mergedClasses
                    : k === 'subclasses' ? mergedSubclasses
                    : k === 'races' ? mergedRaces
                    : k === 'subraces' ? mergedSubraces
                    : k === 'backgrounds' ? mergedBackgrounds
                    : mergedFeats;

                const prev = map.get(entity.id);
                if (prev) {
                    // Record conflict sources
                    const cs = conflictSources.get(entity.id) ?? [prev.sourceId];
                    if (!cs.includes(prev.sourceId)) cs.push(prev.sourceId);
                    if (!cs.includes(ds.id)) cs.push(ds.id);
                    conflictSources.set(entity.id, cs);
                }
                map.set(entity.id, { entity: sourceEntity, sourceId: ds.id });
            }
        }
    }

    // Build conflicts list
    conflictSources.forEach((sources, id) => {
        const kind = mergedClasses.has(id) ? 'class'
            : mergedSubclasses.has(id) ? 'subclass'
            : mergedRaces.has(id) ? 'race'
            : mergedSubraces.has(id) ? 'subrace'
            : mergedBackgrounds.has(id) ? 'background'
            : 'feat';
        conflicts.push({ kind, id, sources });
    });

    return {
        classes: Array.from(mergedClasses.values()).map((v) => v.entity),
        subclasses: Array.from(mergedSubclasses.values()).map((v) => v.entity),
        races: Array.from(mergedRaces.values()).map((v) => v.entity),
        subraces: Array.from(mergedSubraces.values()).map((v) => v.entity),
        backgrounds: Array.from(mergedBackgrounds.values()).map((v) => v.entity),
        feats: Array.from(mergedFeats.values()).map((v) => v.entity),
        conflicts,
    };
}

/** Convert a merged result back into a single Dataset manifest. */
export function mergedToDataset(merged: MergedDatasets, id: string, meta: MergedMetadata): Dataset {
    const stripSource = <T>(items: WithSource<T>[]): T[] =>
        items.map(({ source: _s, qualifiedId: _q, ...rest }) => rest as unknown as T);

    return {
        id,
        name: meta.name,
        system: 'dnd_5',
        edition: '',
        author: meta.author,
        license: meta.license,
        version: meta.version,
        classes: stripSource(merged.classes),
        subclasses: stripSource(merged.subclasses),
        races: stripSource(merged.races),
        subraces: stripSource(merged.subraces),
        backgrounds: stripSource(merged.backgrounds),
        feats: stripSource(merged.feats),
    };
}

// ── Metadata merge ───────────────────────────────────────────────────────
// name/author/version/license aren't per-entity, so they can't be resolved by
// the id-collision logic above — they're derived from the whole set of
// source datasets, in the same order (last = bottom = most authoritative)
// used elsewhere in this file for entity conflicts.

export type MergedMetadata = {
    name: string;
    author: string;
    version: string;
    license: string;
};

/** Case-insensitive dedup that keeps first-seen casing, joined with ", ". */
function dedupJoin(items: string[]): string {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const raw of items) {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const key = trimmed.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        unique.push(trimmed);
    }
    return unique.join(', ');
}

/** Last dataset (bottom of the list) whose field is non-empty, or undefined. */
function lastDefined(datasets: Dataset[], pick: (d: Dataset) => string | undefined): string | undefined {
    for (let i = datasets.length - 1; i >= 0; i--) {
        const value = pick(datasets[i]);
        if (value && value.trim()) return value.trim();
    }
    return undefined;
}

/** Bumps the minor (second) segment of a free-form "major.minor[...]" version string. */
function bumpMinorVersion(version: string | undefined): string {
    if (!version) return '1.0';
    const parts = version.split('.');
    if (parts.length < 2) parts.push('0');
    const minor = parseInt(parts[1], 10);
    parts[1] = String(Number.isNaN(minor) ? 1 : minor + 1);
    return parts.join('.');
}

/**
 * Merges the book-level fields entity merging leaves untouched. Name/author
 * collapse to one value when every source agrees (case-insensitively) or
 * accumulate as a comma list when they don't — so re-merging a book that's
 * already the product of a merge keeps adding new authors instead of
 * duplicating or dropping existing ones. Version bumps the minor segment off
 * the last source that has one. License is taken from the last source that
 * has one, defaulting to CC-BY-SA-4.0 when none do.
 */
export function mergeMetadata(datasets: Dataset[]): MergedMetadata {
    const name = dedupJoin(datasets.map((d) => d.name)) || 'Merged dataset';
    const author = dedupJoin(datasets.flatMap((d) => (d.author ?? '').split(',')));
    const version = bumpMinorVersion(lastDefined(datasets, (d) => d.version));
    const license = lastDefined(datasets, (d) => d.license) ?? 'CC-BY-SA-4.0';
    return { name, author, version, license };
}
