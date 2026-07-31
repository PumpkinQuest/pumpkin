"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, FolderOpen, FilePlus, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Dataset } from "@/modules/dataset-editor/lib/types";
import { loadDatasets, saveDataset, removeDataset, getDataset } from "@/modules/dataset-editor/lib/storage";
import type { ImportResult } from "@/modules/dataset-editor/lib/importDataset";
import { importDatasetFromText } from "@/modules/dataset-editor/lib/importDataset";
import type { LintIssue } from "@/modules/dataset-editor/lib/lint";
import { lintDataset } from "@/modules/dataset-editor/lib/lint";
import { generateDatasetId } from "@/modules/dataset-editor/lib/ids";
import DatasetList from "./library/DatasetList";
import ImportPanel from "./library/ImportPanel";
import DatasetEditor from "./editor/DatasetEditor";
import MergePanel from "./library/MergePanel";
import ExtractPanel from "./library/ExtractPanel";

type View =
    | { mode: 'library' }
    | { mode: 'edit'; datasetId: string }
    | { mode: 'merge' }
    | { mode: 'extract'; datasetId: string };

export default function DatasetManager() {
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [view, setView] = useState<View>({ mode: 'library' });
    const [mounted, setMounted] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [lintIssues, setLintIssues] = useState<Record<string, LintIssue[]>>({});

    useEffect(() => {
        setDatasets(loadDatasets());
        setMounted(true);

        const pending = sessionStorage.getItem("pendingDatasetImport");
        if (pending) {
            sessionStorage.removeItem("pendingDatasetImport");
            const result = importDatasetFromText(pending, []);
            if (result.ok) {
                const next = saveDataset(result.dataset);
                setDatasets(next);
            }
        }
    }, []);

    const ambientFor = useCallback((dataset: Dataset) => datasets.filter((d) => d.id !== dataset.id), [datasets]);

    const updateLintFor = useCallback((dataset: Dataset) => {
        const issues = lintDataset(dataset, ambientFor(dataset));
        setLintIssues((prev) => ({ ...prev, [dataset.id]: issues }));
        return issues;
    }, [ambientFor]);

    const handleImportSuccess = useCallback((result: ImportResult) => {
        if (!result.ok) return;
        const next = saveDataset(result.dataset);
        setDatasets(next);
        updateLintFor(result.dataset);
        setShowImport(false);
    }, [updateLintFor]);

    const handleUpdateDataset = useCallback((dataset: Dataset) => {
        const next = saveDataset(dataset);
        setDatasets(next);
        updateLintFor(dataset);
    }, [updateLintFor]);

    const handleDeleteDataset = useCallback((id: string) => {
        const next = removeDataset(id);
        setDatasets(next);
        setLintIssues((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
        if (view.mode === 'edit' && view.datasetId === id) {
            setView({ mode: 'library' });
        }
    }, [view]);

    const handlePersistDataset = useCallback((dataset: Dataset) => {
        const next = saveDataset(dataset);
        setDatasets(next);
        updateLintFor(dataset);
    }, [updateLintFor]);

    const handleBackFromEditor = useCallback(() => {
        setView({ mode: 'library' });
    }, []);

    const handleCreate = useCallback(() => {
        const id = generateDatasetId();
        const blank: Dataset = {
            id,
            name: 'Новый датасет',
            system: 'dnd_5',
            edition: '2024',
            author: '',
        };
        const next = saveDataset(blank);
        setDatasets(next);
        setView({ mode: 'edit', datasetId: id });
    }, []);

    if (!mounted) return null;

    if (view.mode === 'edit') {
        const ds = getDataset(view.datasetId);
        if (!ds) {
            setView({ mode: 'library' });
            return null;
        }
        const issues = lintIssues[ds.id] ?? [];
        return (
            <DatasetEditor
                dataset={ds}
                issues={issues}
                ambient={ambientFor(ds)}
                onPersist={handlePersistDataset}
                onBack={handleBackFromEditor}
            />
        );
    }

    if (view.mode === 'merge') {
        return (
            <MergePanel
                datasets={datasets}
                onSave={handleUpdateDataset}
                onCancel={() => setView({ mode: 'library' })}
            />
        );
    }

    if (view.mode === 'extract') {
        const ds = getDataset(view.datasetId);
        if (!ds) {
            setView({ mode: 'library' });
            return null;
        }
        return (
            <ExtractPanel
                dataset={ds}
                onSave={handleUpdateDataset}
                onCancel={() => setView({ mode: 'library' })}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Link
                href="/lss/datasets/"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-pumpkin-orange/30 bg-pumpkin-orange/5 hover:bg-pumpkin-orange/10 hover:border-pumpkin-orange/50 transition-all duration-200"
            >
                <span className="text-sm font-medium text-pumpkin-text">
                    Готовые датасеты можно скачать здесь
                </span>
                <ArrowRight size={16} className="text-pumpkin-orange shrink-0" />
            </Link>

            {/* Actions bar */}
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim text-pumpkin-bg font-semibold text-sm transition-colors duration-200"
                >
                    <FilePlus size={16} />
                    Создать
                </button>
                <button
                    onClick={() => setShowImport((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 text-pumpkin-muted hover:text-pumpkin-text text-sm transition-all duration-200"
                >
                    <Plus size={14} />
                    Импорт
                </button>

                {datasets.length >= 2 && (
                    <button
                        onClick={() => setView({ mode: 'merge' })}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 text-pumpkin-muted hover:text-pumpkin-text text-sm transition-all duration-200"
                    >
                        <FolderOpen size={14} />
                        Объединить
                    </button>
                )}
            </div>

            {showImport && (
                <ImportPanel
                    existingIds={new Set(datasets.map((d) => d.id))}
                    ambient={datasets}
                    onImport={handleImportSuccess}
                    onClose={() => setShowImport(false)}
                />
            )}

            {datasets.length === 0 && !showImport && (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <DatabaseIcon className="text-pumpkin-muted opacity-30" />
                    <p className="text-pumpkin-muted text-sm">
                        Нет подключённых датасетов. Нажмите «Создать»
                        или «Импорт», чтобы начать.
                    </p>
                </div>
            )}

            <DatasetList
                datasets={datasets}
                lintIssues={lintIssues}
                onEdit={(id) => setView({ mode: 'edit', datasetId: id })}
                onExtract={(id) => setView({ mode: 'extract', datasetId: id })}
                onDelete={handleDeleteDataset}
                onUpdate={handleUpdateDataset}
            />
        </div>
    );
}

function DatabaseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="24" cy="12" rx="16" ry="6" stroke="currentColor" strokeWidth="2" />
            <path d="M8 12v24c0 3.314 7.163 6 16 6s16-2.686 16-6V12" stroke="currentColor" strokeWidth="2" />
            <path d="M8 24c0 3.314 7.163 6 16 6s16-2.686 16-6" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}
