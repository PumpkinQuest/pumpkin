import { slugify } from './exportDataset';

const HEX = '0123456789abcdef';

function hex6(): string {
    let s = '';
    for (let i = 0; i < 6; i++) s += HEX[Math.floor(Math.random() * 16)];
    return s;
}

/** pq-{uuid} */
export function generateDatasetId(): string {
    return `pq-${crypto.randomUUID()}`;
}

/**
 * `id = slugify(english name)`, not an opaque token (dataset-editor-guide.md
 * §5.7): the id is the only key two independent imports of the same entity
 * (or a reference to it by name) can converge on without a shared JSON to
 * compare. Collisions within the same collection get a numeric suffix — rare,
 * and `duplicate-id` in the linter is the actual backstop for it (§5.7's
 * documented trade-off: two UNRELATED entities sharing an English name).
 */
export function generateEntityIdFromName(name: string, existingIds: Iterable<string>): string {
    const existing = new Set(existingIds);
    const base = slugify(name) || 'entity';
    if (!existing.has(base)) return base;
    let n = 2;
    while (existing.has(`${base}-${n}`)) n++;
    return `${base}-${n}`;
}

/** trait-{hex6} — short stable id for trait grants */
export function generateGrantId(): string {
    return `trait-${hex6()}`;
}
