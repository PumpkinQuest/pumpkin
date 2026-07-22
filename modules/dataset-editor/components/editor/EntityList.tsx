"use client";

import { useState, useCallback } from "react";
import { Plus, ChevronRight } from "lucide-react";
import type { Dataset, Grant } from "../../lib/types";
import type { LintIssue } from "../../lib/lint";
import { countEntities } from "../../lib/extract";
import { generateEntityId } from "../../lib/ids";
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
    errorPaths: Set<string>;
    warnPaths: Set<string>;
    issues: LintIssue[];
    onChange: (ds: Dataset) => void;
    onLint: (ds: Dataset) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EntityRecord = Record<string, any>;

export default function EntityList({ dataset, errorPaths, warnPaths, issues, onChange, onLint }: Props) {
    const [activeTab, setActiveTab] = useState<Kind>('classes');
    const [editingId, setEditingId] = useState<string | null>(null);
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

    const handleAddEntity = useCallback(() => {
        const id = generateEntityId(activeTab, dataset.id);
        setEditingId(id);
    }, [activeTab, dataset.id]);

    if (editing || editingId) {
        const entity = editing ?? makeEmptyEntity(activeTab, editingId ?? '');
        return (
            <EntityEditor
                kind={activeTab}
                entity={entity}
                dataset={dataset}
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

                <button
                    onClick={handleAddEntity}
                    className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-pumpkin-border hover:border-pumpkin-orange/40 text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                >
                    <Plus size={14} />
                    Добавить {KIND_SINGULAR[activeTab]}
                </button>
            </div>
        </div>
    );
}

function makeEmptyEntity(kind: Kind, id: string) {
    const base = { id, label: '' } as Record<string, unknown>;
    switch (kind) {
        case 'classes':
            return { ...base, grants: [], info: { primaryStats: [], complexity: 0 } };
        case 'subclasses':
            return { ...base, classId: '', grants: [] };
        case 'races':
            return { ...base, size: 'medium', grants: [] };
        case 'subraces':
            return { ...base, raceId: '', grants: [] };
        case 'backgrounds':
            return { ...base, grants: [] };
        case 'feats':
            return { ...base, grants: [] };
        default:
            return { ...base, grants: [] };
    }
}
