// ---------------------------------------------------------------------------
// Dataset format — public contract for character builder datasets.
// Each dataset is a "sourcebook": a named container of mechanical presets
// (classes, races, backgrounds, feats, etc.) that a character builder ingests.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Label = string;

export type BonusTarget = string;
export type BonusMode = 'add' | 'set' | 'upgrade' | 'downgrade' | 'multiply';

// ---------------------------------------------------------------------------
// Grants — what an entity gives to a character.
// ---------------------------------------------------------------------------

export type AsiFixedGrant = {
    type: 'asi-fixed';
    values: Partial<Record<StatKey, number>>;
};

export type AsiFlexibleGrant = {
    type: 'asi-flexible';
    sets: Array<{ count: number; amount: number; options?: StatKey[] }>;
    distinct?: boolean;
};

export type AsiPoolGrant = {
    type: 'asi-pool';
    total: number;
    max: number;
    options: StatKey[];
};

export type BonusGrant = {
    type: 'bonus';
    target: BonusTarget;
    mode?: BonusMode;
    value?: number;
    expr?: string;
    label: Label;
};

export type SkillFixedGrant = {
    type: 'skill-fixed';
    skills: string[];
};

export type SkillChoiceGrant = {
    type: 'skill-choice';
    count: number;
    options: string[] | 'any';
};

export type ToolFixedGrant = {
    type: 'tool-fixed';
    tools: string[];
};

export type ToolChoiceGrant = {
    type: 'tool-choice';
    count: number;
    options: string[];
};

export type LanguageFixedGrant = {
    type: 'language-fixed';
    languages: string[];
};

export type LanguageChoiceGrant = {
    type: 'language-choice';
    count: number;
    options?: string[];
};

export type SpeedGrant = {
    type: 'speed';
    value: number;
};

export type SavingThrowGrant = {
    type: 'saving-throw';
    stats: StatKey[];
};

export type TraitGrant = {
    type: 'trait';
    id: string;
    name: string;
    description?: string;
    params?: Record<string, number>;
};

export type ArmorProfKey = 'armor-light' | 'armor-medium' | 'armor-heavy' | 'armor-label';
export type WeaponProfKey = 'weapon-simple' | 'weapon-martial' | 'weapon-other';

export type ArmorProfGrant = {
    type: 'armor-prof';
    armors: ArmorProfKey[];
};

export type WeaponProfGrant = {
    type: 'weapon-prof';
    weapons: WeaponProfKey[];
    specific?: string[];
};

export type CasterProgression = 'full' | 'half' | 'third' | 'pact';

export type SpellcastingGrant = {
    type: 'spellcasting';
    ability: 'int' | 'wis' | 'cha';
    casterType: 'memory' | 'list' | 'book';
    progression?: CasterProgression;
};

export type HpDieGrant = {
    type: 'hp-die';
    die: number;
};

export type ResourceGrant = {
    type: 'resource';
    id: string;
    /**
     * Which `trait` grant's Spoiler block this counter sits above (matched by id
     * within the SAME entity — grants + leveledGrants). Defaults to `id`, which is
     * why the id-of-the-trait convention exists. `null` = deliberately no paired
     * description (e.g. a pool whose benefits are described elsewhere, under other
     * ids). See dataset-editor-guide.md §5.8 point 4.
     */
    pairId?: string | null;
    name: Label;
    max?: number;
    maxExpr?: string;
    isShortRest?: boolean;
    isLongRest?: boolean;
    /**
     * How much a SHORT rest gives back, as a formula (`1`, `[PROF]`, `ceil([LVL]/2)`).
     * Absent ⇒ a short rest refills the pool completely. Only meaningful together
     * with `isShortRest`.
     */
    shortRestRegain?: string;
    /** Free-text note for the rule the counter itself can't express (a cooldown, "one per turn", what a spent point buys). */
    notes?: string;
};

export type EquipmentFixedGrant = {
    type: 'equipment-fixed';
    items: string[];
};

export type EquipmentChoiceGrant = {
    type: 'equipment-choice';
    /** Stable key for the player's pick; falls back to the option contents when absent. */
    id?: string;
    options: string[][];
};

export type GoldGrant = {
    type: 'gold';
    amount: number;
};

export type GoldDiceGrant = {
    type: 'gold-dice';
    dice: string;
};

export type FeatCategory = 'origin' | 'general' | 'fighting-style' | 'epic-boon' | 'invocation';

export type FeatGrant = {
    type: 'feat';
    featId: string;
    category?: FeatCategory;
};

export type PickOneGrant = {
    type: 'pick-one';
    id?: string;
    label?: Label;
    options: Array<{
        id?: string;
        label: Label;
        grants: Grant[];
    }>;
};

export type Grant =
    | AsiFixedGrant
    | AsiFlexibleGrant
    | AsiPoolGrant
    | BonusGrant
    | FeatGrant
    | SkillFixedGrant
    | SkillChoiceGrant
    | ToolFixedGrant
    | ToolChoiceGrant
    | LanguageFixedGrant
    | LanguageChoiceGrant
    | SpeedGrant
    | SavingThrowGrant
    | TraitGrant
    | ArmorProfGrant
    | WeaponProfGrant
    | SpellcastingGrant
    | HpDieGrant
    | ResourceGrant
    | EquipmentFixedGrant
    | EquipmentChoiceGrant
    | GoldGrant
    | GoldDiceGrant
    | PickOneGrant;

// ---------------------------------------------------------------------------
// Dataset entities
// ---------------------------------------------------------------------------

export type LeveledGrants = {
    level: number;
    grants: Grant[];
};

export type DatasetClass = {
    id: string;
    label: Label;
    likes?: Label;
    grants: Grant[];
    leveledGrants?: LeveledGrants[];
    subclassLevel?: number;
    info: {
        primaryStats: string[][];
        complexity: 0 | 1 | 2;
    };
};

export type DatasetSubclass = {
    id: string;
    classId: string;
    label: Label;
    grants?: Grant[];
    leveledGrants?: LeveledGrants[];
    info?: {
        tagline?: Label;
        tags?: Label[];
    };
};

export type DatasetRace = {
    id: string;
    label: Label;
    size: 'small' | 'medium' | 'large';
    grants: Grant[];
    /**
     * Grants gained at a given CHARACTER level — not every species is a level-1
     * bundle: 2024 lineages hand out a spell at levels 3/5, the Goliath's Large
     * Form arrives at 5, each with its own counter that must not exist on a
     * level-1 sheet. Read by the numeric, trait-text and resource channels; the
     * aggregating channels (languages, tools, senses) read the flat `grants` only.
     */
    leveledGrants?: LeveledGrants[];
    info?: {
        tags?: Label[];
    };
};

export type DatasetSubrace = {
    id: string;
    raceId: string;
    label: Label;
    grants?: Grant[];
    /** Same as `DatasetRace.leveledGrants` — the elven/fiendish lineage spells (levels 3 and 5) live here. */
    leveledGrants?: LeveledGrants[];
    info?: {
        tagline?: Label;
        tags?: Label[];
    };
};

export type DatasetBackground = {
    id: string;
    label: Label;
    grants: Grant[];
};

export type DatasetFeat = {
    id: string;
    label: Label;
    category?: FeatCategory;
    prerequisite?: string;
    grants: Grant[];
};

// ---------------------------------------------------------------------------
// Dataset manifest
// ---------------------------------------------------------------------------

export type Dataset = {
    id: string;
    name: string;
    system: string;
    edition: string;
    author: string;
    license?: string;
    version?: string;
    classes?: DatasetClass[];
    subclasses?: DatasetSubclass[];
    races?: DatasetRace[];
    subraces?: DatasetSubrace[];
    backgrounds?: DatasetBackground[];
    feats?: DatasetFeat[];
};

// ---------------------------------------------------------------------------
// Merge types
// ---------------------------------------------------------------------------

export type WithSource<T> = T & {
    source: string;
    qualifiedId: string;
};

export type MergedClass = WithSource<DatasetClass>;
export type MergedSubclass = WithSource<DatasetSubclass>;
export type MergedRace = WithSource<DatasetRace>;
export type MergedSubrace = WithSource<DatasetSubrace>;
export type MergedBackground = WithSource<DatasetBackground>;
export type MergedFeat = WithSource<DatasetFeat>;

export type MergeConflict = {
    kind: 'class' | 'subclass' | 'race' | 'subrace' | 'background' | 'feat';
    id: string;
    sources: string[];
};

export type MergedDatasets = {
    classes: MergedClass[];
    subclasses: MergedSubclass[];
    races: MergedRace[];
    subraces: MergedSubrace[];
    backgrounds: MergedBackground[];
    feats: MergedFeat[];
    conflicts: MergeConflict[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getGrants<T extends Grant>(grants: Grant[], type: T['type']): T[] {
    return grants.filter((g): g is T => g.type === type);
}

export function isCaster(grants: Grant[]): boolean {
    return grants.some((g) => g.type === 'spellcasting');
}
