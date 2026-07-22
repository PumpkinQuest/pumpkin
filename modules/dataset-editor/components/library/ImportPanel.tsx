"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, AlertTriangle, CheckCircle } from "lucide-react";
import { importDatasetFromText, type ImportResult } from "../../lib/importDataset";
import type { LintIssue } from "../../lib/lint";

type Props = {
    existingIds: Set<string>;
    onImport: (result: ImportResult) => void;
    onClose: () => void;
};

export default function ImportPanel({ existingIds, onImport, onClose }: Props) {
    const [text, setText] = useState("");
    const [fileName, setFileName] = useState<string | null>(null);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            setText(reader.result as string);
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    const handleParse = useCallback(() => {
        const res = importDatasetFromText(text);
        setResult(res);
    }, [text]);

    const handleAccept = useCallback(() => {
        if (result?.ok) {
            const dedup = existingIds.has(result.dataset.id);
            if (dedup) {
                const confirmed = window.confirm(
                    `Dataset "${result.dataset.id}" already exists. Overwrite?`,
                );
                if (!confirmed) return;
            }
            onImport(result);
        }
    }, [result, existingIds, onImport]);

    return (
        <div className="rounded-xl border border-pumpkin-border bg-pumpkin-surface overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-pumpkin-border">
                <span className="font-semibold text-sm">Импорт датасета</span>
                <button onClick={onClose} className="p-1 hover:text-pumpkin-text text-pumpkin-muted">
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Drop zone */}
                <div
                    className="flex flex-col items-center gap-2 p-8 border-2 border-dashed border-pumpkin-border rounded-lg hover:border-pumpkin-orange/40 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current?.click()}
                >
                    <Upload size={24} className="text-pumpkin-muted" />
                    <span className="text-sm text-pumpkin-muted">
                        {fileName
                            ? `Выбран: ${fileName}`
                            : 'Перетащите JSON-файл или кликните для выбора'}
                    </span>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFile(file);
                        }}
                    />
                </div>

                {/* Text area */}
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Или вставьте JSON вручную...\n\n{\n  "name": "My Dataset",\n  "system": "dnd_5",\n  "edition": "2014",\n  "author": "...",\n  "races": [...]\n}`}
                    className="w-full h-40 rounded-lg border border-pumpkin-border bg-pumpkin-bg p-3 text-sm font-mono text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50 resize-y"
                    spellCheck={false}
                />

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleParse}
                        disabled={!text.trim()}
                        className="px-4 py-2 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim disabled:opacity-40 disabled:cursor-not-allowed text-pumpkin-bg font-semibold text-sm transition-colors"
                    >
                        Проверить
                    </button>

                    {result?.ok && (
                        <button
                            onClick={handleAccept}
                            className="px-4 py-2 rounded-lg border border-pumpkin-orange/40 text-pumpkin-orange hover:bg-pumpkin-orange/10 font-semibold text-sm transition-colors"
                        >
                            Принять
                        </button>
                    )}
                </div>

                {/* Lint report */}
                {result && (
                    <div className="flex flex-col gap-2">
                        {result.ok ? (
                            <ImportSuccessReport
                                dataset={result.dataset}
                                warnings={result.warnings}
                                generatedId={result.generatedId}
                            />
                        ) : (
                            <ImportFailureReport result={result} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ImportSuccessReport({ dataset, warnings, generatedId }: {
    dataset: { id: string; name: string };
    warnings: LintIssue[];
    generatedId: boolean;
}) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400" />
                <span className="text-sm font-medium text-green-400">
                    OK — &quot;{dataset.name}&quot; ({dataset.id})
                </span>
            </div>
            {generatedId && (
                <span className="text-xs text-pumpkin-muted">
                    ID сгенерирован автоматически: <code>{dataset.id}</code>
                </span>
            )}
            {warnings.length > 0 && (
                <div className="text-xs text-amber-400/80">
                    {warnings.length} предупреждени{warnings.length === 1 ? 'е' : 'й'} (см. ниже)
                </div>
            )}
        </div>
    );
}

function ImportFailureReport({ result }: { result: Extract<ImportResult, { ok: false }> }) {
    return (
        <div className="flex flex-col gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
            <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-400" />
                <span className="text-sm font-medium text-red-400">{result.message}</span>
            </div>
            {result.errors && result.errors.length > 0 && (
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {result.errors.map((e, i) => (
                        <div key={i} className="text-xs text-red-400/80 font-mono">
                            {e.path}: {e.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
