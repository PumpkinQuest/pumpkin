"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import type { Dataset } from "../../lib/types";
import type { LintIssue } from "../../lib/lint";
import { lintDataset } from "../../lib/lint";
import InfoTooltip from "../common/InfoTooltip";
import EntityList from "./EntityList";

type Props = {
    dataset: Dataset;
    issues: LintIssue[];
    /** Other datasets in the user's library — resolves cross-book classId/raceId/featId refs instead of false-flagging them. */
    ambient: Dataset[];
    onPersist: (dataset: Dataset) => void;
    onBack: () => void;
};

export default function DatasetEditor({ dataset, issues, ambient, onPersist, onBack }: Props) {
    const [ds, setDs] = useState<Dataset>(structuredClone(dataset));
    const [lint, setLint] = useState<LintIssue[]>(issues);
    const [saved, setSaved] = useState(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(false);
    const onPersistRef = useRef(onPersist);
    onPersistRef.current = onPersist;
    const ambientRef = useRef(ambient);
    ambientRef.current = ambient;

    const updateField = useCallback(<K extends keyof Dataset>(key: K, value: Dataset[K]) => {
        setDs((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    // Debounced persist: save + relint 500ms after last change
    useEffect(() => {
        if (!mountedRef.current) { mountedRef.current = true; return; }
        if (timerRef.current) clearTimeout(timerRef.current);
        setSaved(false);
        timerRef.current = setTimeout(() => {
            const clean = { ...ds, system: 'dnd_5', license: 'CC-BY-SA-4.0' };
            onPersistRef.current(clean);
            setLint(lintDataset(clean, ambientRef.current));
            setSaved(true);
        }, 500);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [ds]);

    const errorPaths = new Set(lint.filter((i) => i.severity === 'error').map((i) => i.path));
    const warnPaths = new Set(lint.filter((i) => i.severity === 'warning').map((i) => i.path));
    const errCount = lint.filter((i) => i.severity === 'error').length;
    const warnCount = lint.filter((i) => i.severity === 'warning').length;
    const hasIssues = lint.length > 0;

    const relintFromChild = useCallback((childDs: Dataset) => {
        setLint(lintDataset(childDs, ambient));
    }, [ambient]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1 min-w-0">
                    <h2 className="text-lg font-semibold truncate">
                        Редактирование: {ds.name}
                    </h2>
                    {/* id and license are fixed for the lifetime of a dataset — a caption,
                        not two read-only inputs competing with the fields that do accept input. */}
                    <div className="flex items-center gap-2 text-xs text-pumpkin-muted flex-wrap">
                        <span className="font-mono">{ds.id}</span>
                        <InfoTooltip text="Идентификатор датасета. Используется для проверки конфликтов при объединении нескольких датасетов. Генерируется один раз при создании и не меняется." />
                        <span className="opacity-40">·</span>
                        <span>CC-BY-SA-4.0</span>
                        <InfoTooltip text="Creative Commons «Атрибуция — На тех же условиях» 4.0: контент можно свободно использовать, изменять и распространять, но с указанием авторства и с публикацией производных работ под этой же лицензией. Зафиксирована для всех датасетов и не может быть изменена." />
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs transition-colors duration-300 ${saved ? 'text-green-400/60' : 'text-amber-400'}`}>
                        {saved ? 'сохранено' : 'сохраняется…'}
                    </span>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-pumpkin-border text-pumpkin-muted hover:text-pumpkin-text text-sm transition-colors"
                    >
                        <ArrowLeft size={14} />
                        Назад
                    </button>
                </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Название" value={ds.name} onChange={(v) => updateField('name', v)} />
                <Field label="Автор" value={ds.author} onChange={(v) => updateField('author', v)} />
                <Field
                    label="Версия"
                    value={ds.version ?? ''}
                    onChange={(v) => updateField('version', v || undefined)}
                    placeholder="1.0"
                    hint="Свободная строка версии для вашего собственного учёта изменений (например 1.0, 2024.1) — формат не проверяется."
                />
                <EditionToggle value={ds.edition} onChange={(v) => updateField('edition', v)} />
            </div>

            {/* Lint panel */}
            {hasIssues && (
                <LintPanel issues={lint} errCount={errCount} warnCount={warnCount} />
            )}

            {/* Entities */}
            <EntityList
                dataset={ds}
                ambient={ambient}
                errorPaths={errorPaths}
                warnPaths={warnPaths}
                issues={lint}
                onChange={setDs}
                onLint={relintFromChild}
            />
        </div>
    );
}

// ── Lint panel ────────────────────────────────────────────────────────────

function LintPanel({ issues, errCount, warnCount }: { issues: LintIssue[]; errCount: number; warnCount: number }) {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-lg border border-pumpkin-border overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-pumpkin-border/20 transition-colors"
            >
                <span className="text-pumpkin-text font-medium">
                    {errCount > 0 && <span className="text-red-400">{errCount} ошиб{errCount === 1 ? 'ка' : errCount < 5 ? 'ки' : 'ок'}</span>}
                    {errCount > 0 && warnCount > 0 && <span className="text-pumpkin-muted">, </span>}
                    {warnCount > 0 && <span className="text-amber-400">{warnCount} предупреждени{warnCount === 1 ? 'е' : warnCount < 5 ? 'я' : 'й'}</span>}
                    {errCount === 0 && warnCount === 0 && <span className="text-pumpkin-muted">нет замечаний</span>}
                </span>
                <span className="text-pumpkin-muted ml-auto text-[10px]">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="flex flex-col border-t border-pumpkin-border max-h-60 overflow-y-auto">
                    {issues.map((issue, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-2 px-3 py-1.5 text-xs border-b border-pumpkin-border/30 last:border-0 ${
                                issue.severity === 'error' ? 'text-red-400/90 bg-red-500/5' : 'text-amber-400/90'
                            }`}
                        >
                            <span className="font-mono text-[10px] shrink-0 mt-px opacity-60">{issue.path}</span>
                            <span className="min-w-0">{issue.message}</span>
                        </div>
                    ))}
                    {issues.length === 0 && (
                        <div className="px-3 py-2 text-xs text-pumpkin-muted">Нет замечаний</div>
                    )}
                </div>
            )}
        </div>
    );
}

function EditionToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                Редакция
                <InfoTooltip text="Какой редакции (5e (2014) или 5.5e (2024)) соответствует контент датасета — влияет на доступные варианты в некоторых списках." />
            </label>
            <div className="flex rounded-lg border border-pumpkin-border overflow-hidden">
                <button
                    onClick={() => onChange('2014')}
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                        value === '2014'
                            ? 'bg-pumpkin-orange text-pumpkin-bg'
                            : 'bg-pumpkin-bg text-pumpkin-muted hover:text-pumpkin-text'
                    }`}
                >
                    2014
                </button>
                <button
                    onClick={() => onChange('2024')}
                    className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                        value === '2024'
                            ? 'bg-pumpkin-orange text-pumpkin-bg'
                            : 'bg-pumpkin-bg text-pumpkin-muted hover:text-pumpkin-text'
                    }`}
                >
                    2024
                </button>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, disabled, placeholder, hint }: {
    label: string;
    value: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
    placeholder?: string;
    hint?: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                {label}
                {hint && <InfoTooltip text={hint} />}
            </label>
            <input
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-colors ${
                    disabled
                        ? 'border-pumpkin-border/50 bg-pumpkin-border/20 text-pumpkin-muted cursor-not-allowed'
                        : 'border-pumpkin-border bg-pumpkin-bg text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50'
                }`}
            />
        </div>
    );
}
