import type { Grant } from "../types";

// ---------------------------------------------------------------------------
// Grant type registry — which types are known and which are live (consumed by
// a character builder). A known-but-dead type accepts authoring but produces
// no effect, so authors must be warned.
// ---------------------------------------------------------------------------

export type GrantChannel =
    | 'numeric' | 'text' | 'base' | 'choice' | 'gold' | 'resource' | 'container';

export type GrantTypeSpec = {
    channel: GrantChannel;
    live: boolean;
    note?: string;
};

export const GRANT_TYPE_SPECS: Record<Grant['type'], GrantTypeSpec> = {
    // Numeric — projected into bonuses
    'asi-fixed':       { channel: 'numeric', live: true },
    'asi-flexible':    { channel: 'numeric', live: true, note: 'Player allocation via choices.' },
    'asi-pool':        { channel: 'numeric', live: true, note: 'Player allocation via choices.' },
    'bonus':           { channel: 'numeric', live: true, note: 'Target validity checked separately.' },
    'speed':           { channel: 'numeric', live: true, note: 'set-base on speed.walk.' },
    'skill-fixed':     { channel: 'numeric', live: true },
    'saving-throw':    { channel: 'numeric', live: true },
    'armor-prof':      { channel: 'numeric', live: true },
    'weapon-prof':     { channel: 'numeric', live: true, note: 'specific names ride text channel.' },

    // Text — rendered as prose blocks
    'feat':             { channel: 'text', live: true, note: 'Also expanded for its own grants.' },
    'trait':            { channel: 'text', live: true, note: 'Traits WITH params are filtered out from text.' },
    'language-fixed':   { channel: 'text', live: true },
    'language-choice':  { channel: 'text', live: true },
    'tool-fixed':       { channel: 'text', live: true },
    'tool-choice':      { channel: 'text', live: true },
    'equipment-fixed':  { channel: 'text', live: true },
    'equipment-choice': { channel: 'text', live: true },

    // Base writes
    'hp-die': { channel: 'base', live: true },
    'size':   { channel: 'base', live: true, note: 'Categorical, write-once — not the numeric channel.' },

    // Resource pools
    'resource': { channel: 'resource', live: true },

    // Choice-driven
    'skill-choice':     { channel: 'choice', live: true },
    'expertise-choice': { channel: 'choice', live: true, note: 'Proficiency required for each selected skill.' },
    'spellcasting':     { channel: 'choice', live: true },

    // Gold ledger
    'gold':      { channel: 'gold', live: true },
    'gold-dice': { channel: 'gold', live: true },

    // Containers
    'pick-one': { channel: 'container', live: true, note: 'Equipment-or-gold fork; named sub-choices.' },
};

export function findGrantTypeSpec(type: string): GrantTypeSpec | undefined {
    return GRANT_TYPE_SPECS[type as Grant['type']];
}

export function isKnownGrantType(type: string): type is Grant['type'] {
    return findGrantTypeSpec(type) !== undefined;
}

export function isLiveGrantType(type: string): boolean {
    return findGrantTypeSpec(type)?.live ?? false;
}
