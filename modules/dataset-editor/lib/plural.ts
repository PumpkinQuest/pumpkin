/**
 * Russian plural form for a count: `plural(2, ['вариант', 'варианта', 'вариантов'])`.
 * Forms are [1, 2–4, 5+] — the same order every Russian pluralisation table uses.
 */
export function plural(n: number, forms: [string, string, string]): string {
    const abs = Math.abs(n) % 100;
    const last = abs % 10;
    if (abs > 10 && abs < 20) return forms[2];
    if (last > 1 && last < 5) return forms[1];
    if (last === 1) return forms[0];
    return forms[2];
}

/** `2 варианта` — the count and its matching form. */
export function pluralWithCount(n: number, forms: [string, string, string]): string {
    return `${n} ${plural(n, forms)}`;
}
