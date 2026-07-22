"use client";

import { useState, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import type { Dataset } from "../../lib/types";
import { extractEntities, countEntities } from "../../lib/extract";
import { slugifyName } from "../../lib/importDataset";

type Props = {
    dataset: Dataset;
    onSave: (dataset: Dataset) => void;
    onCancel: () => void;
};

type Kind = 'classes' | 'subclasses' | 'races' | 'subraces' | 'backgrounds' | 'feats';

const KIND_LABELS: Record<Kind, string> = {
    classes: 'Классы',
    subclasses: 'Подклассы',
    races: 'Расы',
    subraces: 'Подрасы',
    backgrounds: 'Фоны',
    feats: 'Фиты',
};

export default function ExtractPanel({ dataset, onSave, onCancel }: Props) {
    const [selected, setSelected] = useState<Record<Kind, Set<string>>>({
        classes: new Set(),
        subclasses: new Set(),
        races: new Set(),
        subraces: new Set(),
        backgrounds: new Set(),
        feats: new Set(),
    });
    const [newName, setNewName] = useState(`${dataset.name} (extract)`);

    const toggle = useCallback((kind: Kind, id: string) => {
        setSelected((prev) => {
            const next = { ...prev, [kind]: new Set(prev[kind]) };
            if (next[kind].has(id)) next[kind].delete(id);
            else next[kind].add(id);
            return next;
        });
    }, []);

    const handleExtract = useCallback(() => {
        const result = extractEntities(dataset, {
            classes: Array.from(selected.classes),
            subclasses: Array.from(selected.subclasses),
            races: Array.from(selected.races),
            subraces: Array.from(selected.subraces),
            backgrounds: Array.from(selected.backgrounds),
            feats: Array.from(selected.feats),
        });
        const name = newName.trim() || `${dataset.name} (extract)`;
        const id = slugifyName(name) || `${dataset.id}-extract`;
        result.id = id;
        result.name = name;
        onSave(result);
    }, [dataset, selected, newName, onSave]);

    const counts = countEntities(dataset);
    const selectedCount = Object.values(selected).reduce((a, s) => a + s.size, 0);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <ExternalLink size={18} className="text-pumpkin-orange" />
                <h2 className="text-lg font-semibold">Извлечь из «{dataset.name}»</h2>
            </div>

            <p className="text-sm text-pumpkin-muted">
                Отметьте сущности, которые нужно извлечь в новый датасет.
            </p>

            {/* Entity selectors by kind */}
            <div className="flex flex-col gap-4">
                {(Object.keys(KIND_LABELS) as Kind[]).map((kind) => {
                    const list = dataset[kind];
                    if (!list || list.length === 0) return null;
                    return (
                        <div key={kind} className="flex flex-col gap-1">
                            <span className="text-xs font-medium text-pumpkin-muted uppercase tracking-wide">
                                {KIND_LABELS[kind]} ({list.length})
                            </span>
                            <div className="flex flex-col gap-1">
                                {list.map((entity) => {
                                    const isSelected = selected[kind].has(entity.id);
                                    return (
                                        <label
                                            key={entity.id}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-colors text-sm ${
                                                isSelected
                                                    ? 'border-pumpkin-orange/40 bg-pumpkin-orange/5 text-pumpkin-text'
                                                    : 'border-pumpkin-border/50 bg-transparent text-pumpkin-muted hover:border-pumpkin-orange/20'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggle(kind, entity.id)}
                                                className="accent-pumpkin-orange size-3.5"
                                            />
                                            <span>{entity.label}</span>
                                            <span className="ml-auto text-xs text-pumpkin-muted font-mono">
                                                {entity.id}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Name input */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-pumpkin-muted">Название нового датасета</label>
                <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50"
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleExtract}
                    disabled={selectedCount === 0}
                    className="px-4 py-2 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim disabled:opacity-40 disabled:cursor-not-allowed text-pumpkin-bg font-semibold text-sm transition-colors"
                >
                    Извлечь ({selectedCount})
                </button>
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg border border-pumpkin-border text-pumpkin-muted hover:text-pumpkin-text text-sm transition-colors"
                >
                    Отмена
                </button>
            </div>
        </div>
    );
}
