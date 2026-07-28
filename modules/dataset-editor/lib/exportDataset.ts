import type { Dataset } from "./types";

export function serializeDataset(dataset: Dataset): string {
    return JSON.stringify(dataset, null, 2);
}

const EXPORT_FILENAME_SUFFIX = 'lss-dataset';

/** Practical "passport-style" Cyrillic→Latin transliteration (same scheme used in Russian internal passports/visas). */
const RU_TO_LATIN: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i',
    й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
    у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y',
    ь: '', э: 'e', ю: 'iu', я: 'ia',
};

function transliterate(text: string): string {
    return text
        .split('')
        .map((char) => RU_TO_LATIN[char.toLowerCase()] ?? char)
        .join('');
}

/** Transliterates Cyrillic and collapses everything else into ascii `kebab-case`. */
export function slugify(text: string): string {
    return transliterate(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Builds an export filename: `name_author_edition_lss-dataset.json`.
 * - `name` falls back to `id` when the dataset has no name.
 * - `author`/`edition` sections are dropped entirely when empty.
 * - Cyrillic is transliterated, spaces become hyphens, sections are joined with `_`.
 */
export function getDatasetFilename(dataset: Dataset): string {
    const nameSlug = slugify(dataset.name || dataset.id);
    const authorSlug = dataset.author?.trim() ? slugify(dataset.author) : '';
    const editionSlug = dataset.edition?.trim() ? slugify(dataset.edition) : '';

    const sections = [nameSlug, authorSlug, editionSlug, EXPORT_FILENAME_SUFFIX].filter(Boolean);
    return `${sections.join('_')}.json`;
}

export function downloadDataset(dataset: Dataset): void {
    const json = serializeDataset(dataset);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getDatasetFilename(dataset);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
