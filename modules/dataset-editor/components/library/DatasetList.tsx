"use client";

import { useState, useCallback } from "react";
import { Pencil, Download, Trash2, ExternalLink } from "lucide-react";
import type { Dataset } from "../../lib/types";
import type { LintIssue } from "../../lib/lint";
import { downloadDataset } from "../../lib/exportDataset";
import { countEntities } from "../../lib/extract";
import { KIND_GENITIVE_PLURAL, type EntityKind } from "../../lib/registry/kinds";

type Props = {
    datasets: Dataset[];
    lintIssues: Record<string, LintIssue[]>;
    onEdit: (id: string) => void;
    onExtract: (id: string) => void;
    onDelete: (id: string) => void;
    onUpdate: (dataset: Dataset) => void;
};

export default function DatasetList({ datasets, lintIssues, onEdit, onExtract, onDelete }: Props) {
    // Deleting a dataset is unrecoverable (localStorage, no history), so it asks
    // first — the same inline confirm the entity editor uses.
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    const handleConfirmDelete = useCallback((id: string) => {
        setConfirmingId(null);
        onDelete(id);
    }, [onDelete]);

    if (datasets.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            {datasets.map((ds) => {
                const counts = countEntities(ds);
                const issues = lintIssues[ds.id] ?? [];
                const errorCount = issues.filter((i) => i.severity === 'error').length;
                const warnCount = issues.filter((i) => i.severity === 'warning').length;
                const totalEntities = Object.values(counts).reduce((a, b) => a + b, 0);

                return (
                    <div
                        key={ds.id}
                        className="flex flex-col gap-3 p-5 rounded-xl border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/20 transition-all duration-200"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-pumpkin-text truncate">{ds.name}</span>
                                    <span className="text-xs text-pumpkin-muted font-mono bg-pumpkin-border/50 px-1.5 py-0.5 rounded">
                                        {ds.id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-pumpkin-muted">
                                    {ds.author && <span>{ds.author}</span>}
                                    {ds.version && <span>v{ds.version}</span>}
                                    {ds.system && <span className="uppercase">{ds.system}</span>}
                                    {ds.edition && <span>{ds.edition}</span>}
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => onEdit(ds.id)}
                                    className="p-1.5 rounded-lg hover:bg-pumpkin-border/50 text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                                    title="Редактировать"
                                >
                                    <Pencil size={15} />
                                </button>
                                <button
                                    onClick={() => onExtract(ds.id)}
                                    className="p-1.5 rounded-lg hover:bg-pumpkin-border/50 text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                                    title="Извлечь сущности"
                                >
                                    <ExternalLink size={15} />
                                </button>
                                <button
                                    onClick={() => downloadDataset(ds)}
                                    className="p-1.5 rounded-lg hover:bg-pumpkin-border/50 text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                                    title="Скачать JSON"
                                >
                                    <Download size={15} />
                                </button>
                                {confirmingId === ds.id ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleConfirmDelete(ds.id)}
                                            className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                        >
                                            Удалить
                                        </button>
                                        <button
                                            onClick={() => setConfirmingId(null)}
                                            className="px-2 py-1 rounded text-xs text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                                        >
                                            Нет
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmingId(ds.id)}
                                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-pumpkin-muted hover:text-red-400 transition-colors"
                                        title="Удалить"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Entity counts */}
                        <div className="flex items-center gap-3 flex-wrap text-xs">
                            {Object.entries(counts)
                                .filter(([, n]) => n > 0)
                                .map(([kind, n]) => (
                                    <span key={kind} className="text-pumpkin-muted">
                                        {KIND_GENITIVE_PLURAL[kind as EntityKind]}: {n}
                                    </span>
                                ))}
                            {totalEntities === 0 && (
                                <span className="text-pumpkin-muted">пусто</span>
                            )}
                        </div>

                        {/* Lint badges */}
                        {(errorCount > 0 || warnCount > 0) && (
                            <div className="flex items-center gap-2">
                                {errorCount > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                                        {errorCount} ошиб{errorCount === 1 ? 'ка' : errorCount < 5 ? 'ки' : 'ок'}
                                    </span>
                                )}
                                {warnCount > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                                        {warnCount} предупреждени{warnCount === 1 ? 'е' : warnCount < 5 ? 'я' : 'й'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
