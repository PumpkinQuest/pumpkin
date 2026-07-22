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

const KIND_PREFIX: Record<string, string> = {
    classes: 'class',
    subclasses: 'subclass',
    races: 'race',
    subraces: 'subrace',
    backgrounds: 'backgr',
    feats: 'feat',
};

/** kind-{datasetPrefix6}-{hex6}, e.g. class-pq-a1b-x7k3m9 */
export function generateEntityId(kind: string, datasetId: string): string {
    const prefix = datasetId.slice(0, 6);
    return `${KIND_PREFIX[kind] ?? kind}-${prefix}-${hex6()}`;
}
