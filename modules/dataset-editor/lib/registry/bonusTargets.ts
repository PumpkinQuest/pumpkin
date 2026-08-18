// ---------------------------------------------------------------------------
// Bonus target keys: the contracts of the character sheet's data model.
// These are the valid keys for skills, stats, saves, proficiencies, etc.
// When authoring a `bonus` grant, the `target` field must be one of these
// (or a derivative) for the bonus to be read by the sheet.
// ---------------------------------------------------------------------------

/** Ability score keys of the character sheet. */
export const STAT_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

/** Saving throw keys. */
export const SAVE_KEYS = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const;

/** Skill keys — 18 standard skills. Spelling with spaces is the contract. */
export const SKILL_KEYS = [
    'acrobatics', 'animal handling', 'arcana', 'athletics', 'deception', 'history',
    'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception',
    'performance', 'persuasion', 'religion', 'sleight of hand', 'stealth', 'survival',
] as const;

/** Passive score keys. */
export const PASSIVE_KEYS = ['perception', 'insight', 'investigation'] as const;

/** Speed kinds. */
export const SPEED_KINDS = ['walk', 'fly', 'swim', 'climb', 'burrow'] as const;

/** Attack kinds. */
export const ATTACK_KINDS = ['melee', 'ranged', 'spell'] as const;

/** Spell circles — 1..9, as strings since that's how the bonus target key encodes them (`spellSlot.1`, `pactSlot.9`). */
export const SPELL_CIRCLE_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

/** Armor proficiency checkbox keys. `armor-label` is the shield. */
export const ARMOR_PROF_KEYS = ['armor-light', 'armor-medium', 'armor-heavy', 'armor-label'] as const;

/** Weapon proficiency checkbox keys. */
export const WEAPON_PROF_KEYS = ['weapon-simple', 'weapon-martial', 'weapon-other'] as const;

/** Common languages in the system. */
export const COMMON_LANGUAGES = [
    'common', 'dwarvish', 'elvish', 'giant', 'gnomish', 'goblin', 'halfling',
    'orc', 'abyssal', 'celestial', 'draconic', 'deep speech', 'infernal',
    'primordial', 'sylvan', 'undercommon',
] as const;

/** All stat-like keys for lookup purposes. */
const ALL_STAT_KEYS: readonly string[] = [...STAT_KEYS];

/** All skill keys for lookup. */
const ALL_SKILL_KEYS: readonly string[] = [...SKILL_KEYS];

const ALL_SAVE_KEYS: readonly string[] = [...SAVE_KEYS];

// ---------------------------------------------------------------------------
// Target groups and the registry
// ---------------------------------------------------------------------------

export type BonusTargetGroup =
    | 'stat' | 'save' | 'skill' | 'passive' | 'prof'
    | 'vitality' | 'speed' | 'attack' | 'damage' | 'spell' | 'misc';

export type BonusTargetSpec = {
    id: string;
    group: BonusTargetGroup;
    test: (target: string) => boolean;
    enumerate?: () => string[];
    live: boolean;
};

function keyed(
    id: string, group: BonusTargetGroup, prefix: string,
    keys: readonly string[], live: boolean, suffix = '',
): BonusTargetSpec {
    const full = (k: string): string => `${prefix}${k}${suffix}`;
    const valid = new Set(keys.map(full));
    return { id, group, test: (t) => valid.has(t), enumerate: () => keys.map(full), live };
}

function flat(id: string, group: BonusTargetGroup, live: boolean): BonusTargetSpec {
    return { id, group, test: (t) => t === id, enumerate: () => [id], live };
}

export const BONUS_TARGET_SPECS: BonusTargetSpec[] = [
    // Stats
    keyed('stat.score',    'stat', 'stat.', ALL_STAT_KEYS, true, '.score'),
    keyed('stat.modifier', 'stat', 'stat.', ALL_STAT_KEYS, false, '.modifier'),
    keyed('stat.check',    'stat', 'stat.', ALL_STAT_KEYS, false, '.check'),

    // Saves / skills / passives
    keyed('save',          'save',    'save.',    ALL_SAVE_KEYS,  true),
    keyed('skill',         'skill',   'skill.',   ALL_SKILL_KEYS, true),
    keyed('passive',       'passive', 'passive.', PASSIVE_KEYS,   true),

    // Proficiency ordinals
    keyed('prof.skill',    'prof', 'prof.skill.', ALL_SKILL_KEYS, true),
    keyed('prof.save',     'prof', 'prof.save.',  ALL_SAVE_KEYS,  true),
    keyed('prof.armor',    'prof', 'prof.',       ARMOR_PROF_KEYS,  true),
    keyed('prof.weapon',   'prof', 'prof.',       WEAPON_PROF_KEYS, true),

    // Vitality
    flat('hp.max',         'vitality', true),
    flat('hp.temp',        'vitality', false),
    flat('ac',             'vitality', true),
    flat('shield',         'vitality', true),
    flat('initiative',     'vitality', true),
    flat('vitality.darkvision', 'vitality', false),

    // Speed
    keyed('speed.walk',  'speed', 'speed.', ['walk'], true),
    keyed('speed.other', 'speed', 'speed.', SPEED_KINDS.filter((k) => k !== 'walk'), false),

    // Attack / damage
    { id: 'weapon.attack', group: 'attack', test: (t) => /^weapon\..+\.attack$/.test(t), live: true },
    { id: 'weapon.damage', group: 'damage', test: (t) => /^weapon\..+\.damage$/.test(t), live: true },
    keyed('attack.kind',   'attack', 'attack.', ATTACK_KINDS, false),
    flat('damage.weapon',  'damage', false),
    flat('damage.spell',   'damage', false),

    // Spellcasting
    flat('spellDC',     'spell', true),
    flat('spellAttack', 'spell', true),
    keyed('spellSlot', 'spell', 'spellSlot.', SPELL_CIRCLE_KEYS, true),
    keyed('pactSlot',  'spell', 'pactSlot.',  SPELL_CIRCLE_KEYS, true),

    // Misc
    flat('proficiency', 'misc', false),
    flat('carry',       'misc', false),
];

export function findBonusTargetSpec(target: string): BonusTargetSpec | undefined {
    return BONUS_TARGET_SPECS.find((spec) => spec.test(target));
}

export function isKnownBonusTarget(target: string): boolean {
    return findBonusTargetSpec(target) !== undefined;
}

export function isLiveBonusTarget(target: string): boolean {
    return findBonusTargetSpec(target)?.live ?? false;
}

/** Every concrete live target, grouped — for UI pickers. */
export function listBonusTargetsByGroup(): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    for (const spec of BONUS_TARGET_SPECS) {
        if (!spec.live || !spec.enumerate) continue;
        (out[spec.group] ??= []).push(...spec.enumerate());
    }
    return out;
}
