import { migrateLegacyGrantFields } from "./migrateGrants";
import type { Dataset } from "./types";

const STORAGE_KEY = "pumpkin_datasets";

export function loadDatasets(): Dataset[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw) as Dataset[];
        return parsed.map(migrateLegacyGrantFields);
    } catch {
        return [];
    }
}

export function saveDataset(dataset: Dataset): Dataset[] {
    const list = loadDatasets();
    const idx = list.findIndex((d) => d.id === dataset.id);
    if (idx >= 0) {
        list[idx] = dataset;
    } else {
        list.push(dataset);
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
        // localStorage full — silent fail
    }
    return list;
}

export function removeDataset(id: string): Dataset[] {
    const list = loadDatasets().filter((d) => d.id !== id);
    try {
        if (list.length > 0) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        // ignore
    }
    return list;
}

export function getDataset(id: string): Dataset | undefined {
    return loadDatasets().find((d) => d.id === id);
}
