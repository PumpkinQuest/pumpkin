"use client";

import { useState, useCallback, useMemo, type KeyboardEvent } from "react";
import { Plus, ChevronRight, Search } from "lucide-react";
import type { Dataset } from "../../lib/types";
import type { LintIssue } from "../../lib/lint";
import { countEntities } from "../../lib/extract";
import { generateEntityIdFromName } from "../../lib/ids";
import { slugify } from "../../lib/exportDataset";
import {
    ENTITY_KINDS, KIND_ACCUSATIVE, KIND_GENITIVE_PLURAL, KIND_LABELS, type EntityKind,
} from "../../lib/registry/kinds";
import InfoTooltip from "../common/InfoTooltip";
import EntityEditor from "./EntityEditor";

/** Above this many entities the list gets a search box — below it, scanning is faster than typing. */
const SEARCH_THRESHOLD = 6;

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
    // Races first, classes last — see registry/kinds.ts and guide §7: classes are
    // the least expressible kind and the worst possible landing tab.
    const [activeTab, setActiveTab] = useState<EntityKind>('races');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [pendingName, setPendingName] = useState<string | null>(null);
    const [addingName, setAddingName] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [draftEnglish, setDraftEnglish] = useState('');
    const [query, setQuery] = useState('');
    const counts = countEntities(dataset);

    // Build a map of entity path prefix → error/warning messages for tooltips
    const issueByPrefix = new Map<string, string[]>();
    for (const issue of issues) {
        for (const kind of ENTITY_KINDS) {
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

    const visibleList = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return list;
        return list.filter(
            (e) => String(e.label ?? '').toLowerCase().includes(q) || String(e.id ?? '').includes(q),
        );
    }, [list, query]);

    const updateEntities = useCallback((kind: EntityKind, entities: EntityRecord[]) => {
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
        setDraftEnglish('');
        setAddingName(true);
    }, []);

    // The id comes from the ENGLISH name (guide §5.7: it's the only key two
    // independent imports of the same entity can converge on), the displayed
    // label from what the author typed in Russian. Leaving the English field
    // empty falls back to a transliterated slug of the label rather than
    // blocking the author.
    const idSource = (draftEnglish.trim() || draftName.trim());
    const previewId = idSource ? slugify(idSource) : '';

    const handleConfirmAdd = useCallback(() => {
        const name = draftName.trim();
        if (!name) return;
        const source = draftEnglish.trim() || name;
        const id = generateEntityIdFromName(source, list.map((e) => e.id as string));
        setPendingName(name);
        setEditingId(id);
        setAddingName(false);
    }, [draftName, draftEnglish, list]);

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
                {ENTITY_KINDS.map((kind) => {
                    const count = counts[kind];
                    return (
                        <button
                            key={kind}
                            onClick={() => { setActiveTab(kind); setEditingId(null); setQuery(''); }}
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

            {/* Search */}
            {list.length > SEARCH_THRESHOLD && (
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pumpkin-muted/60" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={`Поиск по ${KIND_GENITIVE_PLURAL[activeTab]}…`}
                        className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg pl-9 pr-3 py-2 text-sm text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50"
                    />
                </div>
            )}

            {/* Entity list */}
            <div className="flex flex-col gap-2">
                {list.length === 0 && (
                    <div className="text-sm text-pumpkin-muted py-4 text-center">
                        Здесь пока пусто
                    </div>
                )}
                {list.length > 0 && visibleList.length === 0 && (
                    <div className="text-sm text-pumpkin-muted py-4 text-center">
                        Ничего не найдено
                    </div>
                )}
                {visibleList.map((entity) => {
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
                })}

                {addingName ? (
                    <div className="flex flex-col gap-3 p-3 rounded-lg border border-pumpkin-orange/40 bg-pumpkin-orange/5">
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-pumpkin-muted">Название</label>
                                <input
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                    placeholder="Кровавый охотник"
                                    autoFocus
                                    className="rounded-lg border border-pumpkin-border bg-pumpkin-bg text-pumpkin-text text-sm px-3 py-1.5 focus:outline-none focus:border-pumpkin-orange/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                                    English name
                                    <InfoTooltip text="Из английского названия генерируется id (например «Blood Hunter» → blood-hunter). Дальше он не меняется — на него ссылаются другие сущности и датасеты, а два независимых импорта одной сущности сойдутся на одном id. Если оставить поле пустым, id соберётся из русского названия транслитерацией." />
                                </label>
                                <input
                                    value={draftEnglish}
                                    onChange={(e) => setDraftEnglish(e.target.value)}
                                    onKeyDown={handleAddKeyDown}
                                    placeholder="Blood Hunter"
                                    className="rounded-lg border border-pumpkin-border bg-pumpkin-bg text-pumpkin-text text-sm px-3 py-1.5 focus:outline-none focus:border-pumpkin-orange/50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
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
                            {previewId && (
                                <span className="ml-auto text-xs text-pumpkin-muted font-mono">
                                    id: {previewId}
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleStartAdd}
                        className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-pumpkin-border hover:border-pumpkin-orange/40 text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors"
                    >
                        <Plus size={14} />
                        Добавить {KIND_ACCUSATIVE[activeTab]}
                    </button>
                )}
            </div>
        </div>
    );
}

function makeEmptyEntity(kind: EntityKind, id: string, name: string) {
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
