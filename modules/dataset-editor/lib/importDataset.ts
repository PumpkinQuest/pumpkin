import { lintDataset } from "./lint";
import type { LintIssue } from "./lint";
import type { Dataset } from "./types";

/** The collections a valid dataset must have at least one entity in. */
const COLLECTIONS = ['classes', 'subclasses', 'races', 'subraces', 'backgrounds', 'feats'] as const;

// ── Result types ───────────────────────────────────────────────────────────

export type ImportSuccess = {
    ok: true;
    dataset: Dataset;
    warnings: LintIssue[];
    generatedId: boolean;
};

export type ImportFailure = {
    ok: false;
    reason: 'parse' | 'shape' | 'lint';
    message: string;
    errors?: LintIssue[];
};

export type ImportResult = ImportSuccess | ImportFailure;

// ── Helpers ────────────────────────────────────────────────────────────────

function coerceString(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;
}

export function slugifyName(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-zа-яё0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '');
}

function coerceDataset(raw: Record<string, unknown>): { dataset: Dataset; generatedId: boolean } {
    const rawId = typeof raw.id === 'string' ? raw.id.trim() : '';
    const generatedId = rawId === '';
    const name = coerceString(raw.name, 'Imported dataset');
    const id = rawId || slugifyName(name) || 'imported-dataset';

    const dataset: Dataset = {
        ...(raw as object),
        id,
        name,
        system: coerceString(raw.system, 'dnd_5'),
        edition: typeof raw.edition === 'string' ? raw.edition : '',
        author: coerceString(raw.author, 'Unknown author'),
    } as Dataset;

    return { dataset, generatedId };
}

// ── Import ─────────────────────────────────────────────────────────────────

export function importDatasetFromText(text: string): ImportResult {
    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return { ok: false, reason: 'parse', message: 'File is not valid JSON.' };
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { ok: false, reason: 'shape', message: 'Expected a JSON object (dataset manifest).' };
    }

    const raw = parsed as Record<string, unknown>;
    const hasAnyEntity = COLLECTIONS.some(
        (k) => Array.isArray(raw[k]) && (raw[k] as unknown[]).length > 0,
    );
    if (!hasAnyEntity) {
        return {
            ok: false,
            reason: 'shape',
            message: 'Dataset contains no entities (classes/subclasses/races/subraces/backgrounds/feats).',
        };
    }

    const { dataset, generatedId } = coerceDataset(raw);
    const issues = lintDataset(dataset);
    const errors = issues.filter((i) => i.severity === 'error');
    if (errors.length > 0) {
        return {
            ok: false,
            reason: 'lint',
            message: `Dataset rejected: ${errors.length} validation error${errors.length === 1 ? '' : 's'}.`,
            errors,
        };
    }

    const warnings = issues.filter((i) => i.severity === 'warning');
    return { ok: true, dataset, warnings, generatedId };
}
