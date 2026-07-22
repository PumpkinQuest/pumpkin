"use client";

import { useState, useCallback } from "react";
import { ArrowRightLeft, AlertTriangle } from "lucide-react";
import type { Dataset } from "../../lib/types";
import { mergeDatasets, mergedToDataset } from "../../lib/merge";
import { generateDatasetId } from "../../lib/ids";

type Props = {
    datasets: Dataset[];
    onSave: (dataset: Dataset) => void;
    onCancel: () => void;
};

export default function MergePanel({ datasets, onSave, onCancel }: Props) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [mergedName, setMergedName] = useState("");

    const toggle = useCallback((id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const selectedDatasets = datasets.filter((d) => selected.has(d.id));
    const merged = mergeDatasets(selectedDatasets);

    const handleMerge = useCallback(() => {
        const name = mergedName.trim() || "Merged dataset";
        const id = generateDatasetId();
        const result = mergedToDataset(merged, id, name);
        onSave(result);
    }, [merged, mergedName, onSave]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-pumpkin-orange" />
                <h2 className="text-lg font-semibold">Объединение датасетов</h2>
            </div>

            <p className="text-sm text-pumpkin-muted">
                Выберите датасеты для объединения. При конфликте одинаковых id
                сущностей побеждает последний в списке (снизу).
            </p>

            {/* Dataset selector */}
            <div className="flex flex-col gap-2">
                {datasets.map((ds, i) => {
                    const isSelected = selected.has(ds.id);
                    return (
                        <label
                            key={ds.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected
                                    ? 'border-pumpkin-orange/40 bg-pumpkin-orange/5'
                                    : 'border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/20'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggle(ds.id)}
                                className="accent-pumpkin-orange"
                            />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{ds.name}</span>
                                <span className="text-xs text-pumpkin-muted">{ds.id}</span>
                            </div>
                            {isSelected && (
                                <span className="ml-auto text-xs text-pumpkin-muted font-mono">
                                    #{selectedDatasets.indexOf(ds) + 1}
                                </span>
                            )}
                        </label>
                    );
                })}
            </div>

            {/* Conflicts */}
            {merged.conflicts.length > 0 && (
                <div className="flex flex-col gap-2 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <span className="text-sm font-medium text-amber-400">
                            {merged.conflicts.length} конфликт{merged.conflicts.length === 1 ? '' : 'ов'}
                        </span>
                    </div>
                    <div className="text-xs text-amber-400/80 flex flex-col gap-1">
                        {merged.conflicts.map((c, i) => (
                            <div key={i}>
                                {c.kind} &quot;{c.id}&quot; определён в: {c.sources.join(', ')} → победил последний
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Name input */}
            <div className="flex flex-col gap-1">
                <label className="text-xs text-pumpkin-muted">Название объединённого датасета</label>
                <input
                    value={mergedName}
                    onChange={(e) => setMergedName(e.target.value)}
                    placeholder="Merged dataset"
                    className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50"
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleMerge}
                    disabled={selected.size < 2}
                    className="px-4 py-2 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim disabled:opacity-40 disabled:cursor-not-allowed text-pumpkin-bg font-semibold text-sm transition-colors"
                >
                    Объединить
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
