import type { Dataset } from "./types";

export type EntitySelection = {
    classes?: string[];
    subclasses?: string[];
    races?: string[];
    subraces?: string[];
    backgrounds?: string[];
    feats?: string[];
};

/** Extract a subset of entities into a new dataset. */
export function extractEntities(source: Dataset, selection: EntitySelection): Dataset {
    return {
        id: '',
        name: `${source.name} (extract)`,
        system: source.system,
        edition: source.edition,
        author: source.author,
        license: source.license,
        version: source.version,
        classes: source.classes?.filter((c) => selection.classes?.includes(c.id)),
        subclasses: source.subclasses?.filter((s) => selection.subclasses?.includes(s.id)),
        races: source.races?.filter((r) => selection.races?.includes(r.id)),
        subraces: source.subraces?.filter((s) => selection.subraces?.includes(s.id)),
        backgrounds: source.backgrounds?.filter((b) => selection.backgrounds?.includes(b.id)),
        feats: source.feats?.filter((f) => selection.feats?.includes(f.id)),
    };
}

/** Count entities in a dataset, grouped by kind. */
export function countEntities(dataset: Dataset): Record<string, number> {
    return {
        classes: dataset.classes?.length ?? 0,
        subclasses: dataset.subclasses?.length ?? 0,
        races: dataset.races?.length ?? 0,
        subraces: dataset.subraces?.length ?? 0,
        backgrounds: dataset.backgrounds?.length ?? 0,
        feats: dataset.feats?.length ?? 0,
    };
}
