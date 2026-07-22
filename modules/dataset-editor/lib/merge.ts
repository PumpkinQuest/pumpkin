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
export function mergedToDataset(merged: MergedDatasets, id: string, name: string): Dataset {
    const stripSource = <T>(items: WithSource<T>[]): T[] =>
        items.map(({ source: _s, qualifiedId: _q, ...rest }) => rest as unknown as T);

    return {
        id,
        name,
        system: 'dnd_5',
        edition: '',
        author: '',
        classes: stripSource(merged.classes),
        subclasses: stripSource(merged.subclasses),
        races: stripSource(merged.races),
        subraces: stripSource(merged.subraces),
        backgrounds: stripSource(merged.backgrounds),
        feats: stripSource(merged.feats),
    };
}
