import type { BonusGrant, Dataset, Grant, LeveledGrants, ResourceGrant } from "./types";

// ---------------------------------------------------------------------------
// Legacy field migration — `bonus.value` and `resource.max` used to live
// alongside `expr` / `maxExpr` as separate plain-number fields. They're gone
// from the type now (see dataset-editor-guide.md), but datasets saved before
// this change still carry them on disk / in localStorage. Runs on every load
// so old data keeps working without the author having to touch anything.
// ---------------------------------------------------------------------------

function migrateBonus(grant: BonusGrant): BonusGrant {
    const legacyValue = (grant as unknown as { value?: number }).value;
    if (legacyValue === undefined) return grant;
    // Drop `value` along with the migration — leaving it next to `expr` makes
    // the exported file fail LSS's "exactly one of value | expr" lint.
    const { value: _legacyValue, expr, ...rest } = grant as BonusGrant & { value?: number };
    return { ...rest, expr: expr ?? String(legacyValue) };
}

function migrateResource(grant: ResourceGrant): ResourceGrant {
    const legacyMax = (grant as unknown as { max?: number }).max;
    if (legacyMax === undefined) return grant;
    // Same for `max` — LSS rejects a resource carrying both `max` and `maxExpr`.
    const { max: _legacyMax, maxExpr, ...rest } = grant as ResourceGrant & { max?: number };
    return { ...rest, maxExpr: maxExpr ?? String(legacyMax) };
}

function migrateGrant(grant: Grant): Grant {
    switch (grant.type) {
        case 'bonus':
            return migrateBonus(grant);
        case 'resource':
            return migrateResource(grant);
        case 'pick-one':
            return { ...grant, options: grant.options.map((opt) => ({ ...opt, grants: migrateGrantList(opt.grants) })) };
        default:
            return grant;
    }
}

function migrateGrantList(grants: Grant[]): Grant[] {
    return grants.map(migrateGrant);
}

function migrateLeveledGrants(leveledGrants?: LeveledGrants[]): LeveledGrants[] | undefined {
    return leveledGrants?.map((lg) => ({ ...lg, grants: migrateGrantList(lg.grants) }));
}

export function migrateLegacyGrantFields(dataset: Dataset): Dataset {
    return {
        ...dataset,
        classes: dataset.classes?.map((c) => ({
            ...c,
            grants: migrateGrantList(c.grants),
            leveledGrants: migrateLeveledGrants(c.leveledGrants),
        })),
        subclasses: dataset.subclasses?.map((c) => ({
            ...c,
            grants: c.grants && migrateGrantList(c.grants),
            leveledGrants: migrateLeveledGrants(c.leveledGrants),
        })),
        races: dataset.races?.map((r) => ({
            ...r,
            grants: migrateGrantList(r.grants),
            leveledGrants: migrateLeveledGrants(r.leveledGrants),
        })),
        subraces: dataset.subraces?.map((r) => ({
            ...r,
            grants: r.grants && migrateGrantList(r.grants),
            leveledGrants: migrateLeveledGrants(r.leveledGrants),
        })),
        backgrounds: dataset.backgrounds?.map((b) => ({ ...b, grants: migrateGrantList(b.grants) })),
        feats: dataset.feats?.map((f) => ({ ...f, grants: migrateGrantList(f.grants) })),
    };
}
