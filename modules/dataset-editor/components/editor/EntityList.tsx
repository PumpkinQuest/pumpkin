"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { Plus, ChevronRight } from "lucide-react";
import type { Dataset, Grant } from "../../lib/types";
import type { LintIssue } from "../../lib/lint";
import { countEntities } from "../../lib/extract";
import { generateEntityIdFromName } from "../../lib/ids";
import InfoTooltip from "../common/InfoTooltip";
import EntityEditor from "./EntityEditor";

type Kind = 'classes' | 'subclasses' | 'races' | 'subraces' | 'backgrounds' | 'feats';

const KINDS: Kind[] = ['classes', 'subclasses', 'races', 'subraces', 'backgrounds', 'feats'];

const KIND_LABELS: Record<Kind, string> = {
    classes: 'Классы',
    subclasses: 'Подклассы',
    races: 'Расы',
    subraces: 'Подрасы',
    backgrounds: 'Предыстории',
    feats: 'Черты',
};

const KIND_SINGULAR: Record<Kind, string> = {
    classes: 'класс',
    subclasses: 'подкласс',
    races: 'расу',
    subraces: 'подрасу',
    backgrounds: 'предысторию',
    feats: 'черту',
};

type Props = {
    dataset: Dataset;
    /** Other datasets in the library — lets classId/raceId pickers offer cross-book targets. */
    ambient: Dataset[];
    errorPaths: Set<string>;
    warnPaths: Set<string>;
    issues: LintIssue[];
    onChange: (ds: Dataset) => void;
    onLint: (ds: Dataset) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EntityRecord = Record<string, any>;

export default function EntityList({ dataset, ambient, errorPaths, warnPaths, issues, onChange, onLint }: Props) {
    const [activeTab, setActiveTab] = useState<Kind>('classes');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [pendingName, setPendingName] = useState<string | null>(null);
    const [addingName, setAddingName] = useState(false);
    const [draftName, setDraftName] = useState('');
    const counts = countEntities(dataset);

    // Build a map of entity path prefix → error/warning messages for tooltips
    const issueByPrefix = new Map<string, string[]>();
    for (const issue of issues) {
        for (const kind of KINDS) {
            const prefix = `${kind}/`;
            if (issue.path.startsWith(prefix)) {
                const entityId = issue.path.slice(prefix.length).split('/')[0].split('@')[0];
                const key = `${kind}/${entityId}`;
                if (!issueByPrefix.has(key)) issueByPrefix.set(key, []);
                issueByPrefix.get(key)!.push(`[${issue.severity}] ${issue.message}`);
            }
        }
    }

    const list = (dataset[activeTab] ?? []) as EntityRecord[];
    const editing = editingId ? list.find((e) => e.id === editingId) : null;

    const updateEntities = useCallback((kind: Kind, entities: EntityRecord[]) => {
        onChange({ ...dataset, [kind]: entities } as Dataset);
        onLint({ ...dataset, [kind]: entities } as Dataset);
    }, [dataset, onChange, onLint]);

    const handleSaveEntity = useCallback((entity: EntityRecord) => {
        const entities = [...list];
        const idx = entities.findIndex((e) => e.id === entity.id);
        if (idx >= 0) {
            entities[idx] = entity;
        } else {
            entities.push(entity);
        }
        updateEntities(activeTab, entities);
        setEditingId(null);
    }, [list, activeTab, updateEntities]);

    const handleDeleteEntity = useCallback((entityId: string) => {
        const entities = list.filter((e) => e.id !== entityId);
        updateEntities(activeTab, entities);
        if (editingId === entityId) setEditingId(null);
    }, [list, activeTab, updateEntities, editingId]);

    const handleStartAdd = useCallback(() => {
        setDraftName('');
        setAddingName(true);
    }, []);

    const handleConfirmAdd = useCallback(() => {
        const name = draftName.trim();
        if (!name) return;
        const id = generateEntityIdFromName(name, list.map((e) => e.id as string));
        setPendingName(name);
        setEditingId(id);
        setAddingName(false);
    }, [draftName, list]);

    const handleCancelAdd = useCallback(() => setAddingName(false), []);

    const handleAddKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Enter') handleConfirmAdd();
        if (e.key === 'Escape') handleCancelAdd();
    }, [handleConfirmAdd, handleCancelAdd]);

    if (editing || editingId) {
        const entity = editing ?? makeEmptyEntity(activeTab, editingId ?? '', pendingName ?? '');
        return (
            <EntityEditor
                kind={activeTab}
                entity={entity}
                dataset={dataset}
                ambient={ambient}
                errorPaths={errorPaths}
                warnPaths={warnPaths}
                onSave={handleSaveEntity}
                onDelete={() => {
                    if (editing) handleDeleteEntity((editing as EntityRecord).id as string);
                    setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-pumpkin-border overflow-x-auto">
                {KINDS.map((kind) => {
                    const count = counts[kind];
                    return (
                        <button
                            key={kind}
                            onClick={() => { setActiveTab(kind); setEditingId(null); }}
                            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === kind
                                    ? 'border-pumpkin-orange text-pumpkin-text'
                                    : 'border-transparent text-pumpkin-muted hover:text-pumpkin-text'
                            }`}
                        >
                            {KIND_LABELS[kind]}
                            {count > 0 && (
                                <span className="ml-1.5 text-xs text-pumpkin-muted">({count})</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Entity list */}
            <div className="flex flex-col gap-2">
                {list.length === 0 ? (
                    <div className="text-sm text-pumpkin-muted py-4 text-center">
                        Нет {KIND_LABELS[activeTab].toLowerCase()}
                    </div>
                ) : (
                    list.map((entity) => {
                        const prefix = `${activeTab}/${entity.id}`;
                        const hasError = Array.from(errorPaths).some((p) => p.startsWith(prefix));
                        const hasWarn = Array.from(warnPaths).some((p) => p.startsWith(prefix));
                        const entityIssues = issueByPrefix.get(prefix);

                        return (
                            <button
                                key={entity.id}
                                onClick={() => setEditingId(entity.id)}
                                title={entityIssues?.join('\n')}
                                className="flex items-center gap-3 p-3 rounded-lg border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/30 text-left transition-colors group"
                            >
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-sm font-medium text-pumpkin-text truncate">
                                        {entity.label}
                                    </span>
                                    <span className="text-xs text-pumpkin-muted font-mono">
                                        {entity.id}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasError && (
                                        <span className="w-2 h-2 rounded-full bg-red-400" title="Есть ошибки" />
                                    )}
                                    {hasWarn && !hasError && (
                                        <span className="w-2 h-2 rounded-full bg-amber-400" title="Есть предупреждения" />
                                    )}
                                    <ChevronRight size={14} className="text-pumpkin-muted group-hover:text-pumpkin-orange transition-colors" />
                                </div>
                            </button>
                        );
                    })
                )}

                {addingName ? (
                    <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-pumpkin-orange/40 bg-pumpkin-orange/5">
                        <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                            Английское название
                            <InfoTooltip text="Id будет сгенерирован как слаг этого названия (например «Blood Hunter» → blood-hunter) и дальше не будет меняться — на него смогут сослаться другие датасеты (classId у подкласса и т.п.), а два независимых импорта одной сущности сойдутся на одном id. Отображаемое название (label) можно будет свободно менять позже — оно ни на что не влияет." />
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                                onKeyDown={handleAddKeyDown}
                                placeholder="Blood Hunter"
                                autoFocus
                                className="flex-1 rounded-lg border border-pumpkin-border bg-pumpkin-bg text-pumpkin-text text-sm px-3 py-1.5 focus:outline-none focus:border-pumpkin-orange/50"
                            />
                            <button
                                onClick={handleConfirmAdd}
                                disabled={!draftName.trim()}
                                className="px-3 py-1.5 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim disabled:opacity-40 disabled:cursor-not-allowed text-pumpkin-bg text-sm font-medium transition-colors"
                            >
                                Создать
                            </button>
                            <button
                                onClick={handleCancelAdd}
                                className="text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleStartAdd}
                        className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-pumpkin-border hover:border-pumpkin-orange/40 text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                    >
                        <Plus size={14} />
                        Добавить {KIND_SINGULAR[activeTab]}
                    </button>
                )}
            </div>
        </div>
    );
}

function makeEmptyEntity(kind: Kind, id: string, name: string) {
    const base = { id, label: name } as Record<string, unknown>;
    switch (kind) {
        case 'classes':
            return { ...base, grants: [], leveledGrants: [], info: { primaryStats: [], complexity: 0 } };
        case 'subclasses':
            return { ...base, classId: '', grants: [], leveledGrants: [] };
        case 'races':
            return { ...base, size: 'medium', grants: [], leveledGrants: [] };
        case 'subraces':
            return { ...base, raceId: '', grants: [], leveledGrants: [] };
        case 'backgrounds':
            return { ...base, grants: [] };
        case 'feats':
            return { ...base, grants: [] };
        default:
            return { ...base, grants: [] };
    }
}
