"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, GripVertical, Search } from "lucide-react";
import type { Grant } from "../../lib/types";
import { generateGrantId } from "../../lib/ids";
import { GRANT_TYPE_LABELS, GRANT_TYPES, grantTypeLabel } from "../../lib/registry/grantLabels";
import {
    ARMOR_PROF_LABELS, CASTER_PROGRESSION_LABELS, CASTER_TYPE_LABELS, LANGUAGE_LABELS,
    SKILL_LABELS, STAT_LABELS, WEAPON_PROF_LABELS, labelList, labelOf,
} from "../../lib/registry/labels";
import { pluralWithCount } from "../../lib/plural";
import GrantEditor from "./GrantEditor";

type Props = {
    grants: Grant[];
    entityPath: string;
    /** Every `trait` grant across the whole entity — offered as the "pairs with" target when adding/editing a `resource` grant. */
    siblingTraits: Array<{ id: string; name: string }>;
    onChange: (grants: Grant[]) => void;
    compact?: boolean;
};

export default function GrantList({ grants, entityPath, siblingTraits, onChange, compact }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [addingType, setAddingType] = useState<string | null>(null);
    const [typeQuery, setTypeQuery] = useState('');

    const visibleTypes = useMemo(() => {
        const q = typeQuery.trim().toLowerCase();
        if (!q) return GRANT_TYPES;
        return GRANT_TYPES.filter(
            (type) => GRANT_TYPE_LABELS[type].toLowerCase().includes(q) || type.includes(q),
        );
    }, [typeQuery]);

    const handleStartAdd = useCallback(() => {
        setTypeQuery('');
        setAddingType('_pick');
    }, []);

    const handleCancelAdd = useCallback(() => {
        setTypeQuery('');
        setAddingType(null);
    }, []);

    const handleAdd = useCallback((type: string) => {
        const newGrant = makeDefaultGrant(type, siblingTraits);
        const next = [...grants, newGrant];
        onChange(next);
        setEditingIndex(next.length - 1);
        setTypeQuery('');
        setAddingType(null);
    }, [grants, onChange, siblingTraits]);

    const handleUpdate = useCallback((index: number, grant: Grant) => {
        const next = [...grants];
        next[index] = grant;
        onChange(next);
        setEditingIndex(null);
    }, [grants, onChange]);

    const handleDelete = useCallback((index: number) => {
        const next = grants.filter((_, i) => i !== index);
        onChange(next);
        setEditingIndex(null);
    }, [grants, onChange]);

    const handleMove = useCallback((index: number, direction: -1 | 1) => {
        const next = [...grants];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    }, [grants, onChange]);

    return (
        <div className="flex flex-col gap-2">
            {grants.map((grant, i) => {
                if (editingIndex === i) {
                    return (
                        <GrantEditor
                            key={i}
                            grant={grant}
                            entityPath={`${entityPath}/grants[${i}]`}
                            siblingTraits={siblingTraits}
                            onSave={(g) => handleUpdate(i, g)}
                            onCancel={() => setEditingIndex(null)}
                            onDelete={() => handleDelete(i)}
                        />
                    );
                }

                const typeLabel = grantTypeLabel(grant.type);
                const summary = grantSummary(grant);

                return (
                    <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/20 transition-colors group cursor-pointer"
                        onClick={() => setEditingIndex(i)}
                    >
                        <GripVertical size={14} className="text-pumpkin-muted opacity-0 group-hover:opacity-100 shrink-0" />
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-pumpkin-orange/10 text-pumpkin-orange shrink-0">
                            {typeLabel}
                        </span>
                        <span className="text-xs text-pumpkin-muted truncate flex-1">
                            {summary}
                        </span>
                        {!compact && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMove(i, -1); }}
                                    disabled={i === 0}
                                    className="p-0.5 text-pumpkin-muted hover:text-pumpkin-text disabled:opacity-30 text-xs"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleMove(i, 1); }}
                                    disabled={i === grants.length - 1}
                                    className="p-0.5 text-pumpkin-muted hover:text-pumpkin-text disabled:opacity-30 text-xs"
                                >
                                    ↓
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Add grant picker */}
            {addingType ? (
                <div className="flex flex-col gap-1.5 p-3 rounded-lg border border-pumpkin-orange/40 bg-pumpkin-orange/5">
                    <span className="text-xs text-pumpkin-muted">Тип гранта:</span>
                    <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-pumpkin-muted/60" />
                        <input
                            value={typeQuery}
                            onChange={(e) => setTypeQuery(e.target.value)}
                            placeholder="Поиск по типам…"
                            autoFocus
                            className="w-full rounded-md border border-pumpkin-border bg-pumpkin-bg pl-7 pr-2 py-1.5 text-xs text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50"
                        />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                        {visibleTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleAdd(type)}
                                className="text-left px-2 py-1 rounded text-xs text-pumpkin-muted hover:bg-pumpkin-orange/10 hover:text-pumpkin-text transition-colors"
                            >
                                {GRANT_TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>
                    {visibleTypes.length === 0 && (
                        <span className="text-xs text-pumpkin-muted/70">Ничего не найдено</span>
                    )}
                    <button
                        onClick={handleCancelAdd}
                        className="text-xs text-pumpkin-muted hover:text-pumpkin-text self-start"
                    >
                        Отмена
                    </button>
                </div>
            ) : (
                <button
                    onClick={handleStartAdd}
                    className="flex items-center gap-1.5 text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors self-start py-1"
                >
                    <Plus size={14} />
                    Добавить грант
                </button>
            )}
        </div>
    );
}

function makeDefaultGrant(type: string, siblingTraits: Array<{ id: string; name: string }>): Grant {
    switch (type) {
        case 'resource': {
            // Prefill from the entity's traits per dataset-editor-guide.md §5.8
            // point 4: a blank "which trait does this belong to" is a silent
            // wrong-placement default, not a neutral one. Exactly one sibling
            // trait → assume it's the one being paired; otherwise leave the id
            // blank and let the author pick explicitly in the form.
            if (siblingTraits.length === 1) {
                return { type: 'resource', id: siblingTraits[0].id, name: siblingTraits[0].name };
            }
            return { type: 'resource', id: '', name: '' };
        }
        case 'asi-fixed': return { type: 'asi-fixed', values: {} };
        case 'asi-flexible': return { type: 'asi-flexible', sets: [] };
        case 'asi-pool': return { type: 'asi-pool', total: 3, max: 2, options: [] };
        case 'bonus': return { type: 'bonus', target: '', value: 0, label: '' };
        case 'feat': return { type: 'feat', featId: '' };
        case 'skill-fixed': return { type: 'skill-fixed', skills: [] };
        case 'skill-choice': return { type: 'skill-choice', count: 1, options: 'any' };
        case 'expertise-choice': return { type: 'expertise-choice', count: 1 };
        case 'tool-fixed': return { type: 'tool-fixed', tools: [] };
        case 'tool-choice': return { type: 'tool-choice', count: 1, options: [] };
        case 'language-fixed': return { type: 'language-fixed', languages: [] };
        case 'language-choice': return { type: 'language-choice', count: 1 };
        case 'speed': return { type: 'speed', value: 30 };
        case 'saving-throw': return { type: 'saving-throw', stats: [] };
        case 'trait': return { type: 'trait', id: generateGrantId(), name: '', description: '' };
        case 'armor-prof': return { type: 'armor-prof', armors: [] };
        case 'weapon-prof': return { type: 'weapon-prof', weapons: [] };
        case 'spellcasting': return { type: 'spellcasting', ability: 'int', casterType: 'list' };
        case 'hp-die': return { type: 'hp-die', die: 8 };
        case 'equipment-fixed': return { type: 'equipment-fixed', items: [] };
        case 'equipment-choice': return { type: 'equipment-choice', options: [] };
        case 'gold': return { type: 'gold', amount: 0 };
        case 'gold-dice': return { type: 'gold-dice', dice: '5d4' };
        case 'pick-one': return { type: 'pick-one', options: [] };
        default: return { type: 'bonus', target: '', value: 0, label: '' } as Grant;
    }
}

const OPTION_FORMS: [string, string, string] = ['вариант', 'варианта', 'вариантов'];

function signed(value: number): string {
    return value >= 0 ? `+${value}` : String(value);
}

/** One-line preview shown on a collapsed grant row. Author-facing, so: Russian, keys resolved to labels. */
function grantSummary(grant: Grant): string {
    switch (grant.type) {
        case 'asi-fixed': {
            const values = Object.entries(grant.values).filter(([, v]) => v !== undefined);
            return values.map(([k, v]) => `${labelOf(STAT_LABELS, k)} ${signed(v as number)}`).join(', ') || '—';
        }
        case 'asi-flexible':
            return grant.sets.map((s) => `${s.count} × ${signed(s.amount)}`).join(', ') || '—';
        case 'asi-pool':
            return `${grant.total} очк. всего, максимум ${grant.max} на характеристику`;
        case 'bonus': {
            const amount = grant.value !== undefined ? signed(grant.value) : (grant.expr || '?');
            return `${grant.target} ${amount}${grant.label ? ` — ${grant.label}` : ''}`;
        }
        case 'feat':
            return grant.featId === 'any' ? 'любая черта на выбор' : (grant.featId || '—');
        case 'skill-fixed':
            return labelList(SKILL_LABELS, grant.skills) || '—';
        case 'skill-choice':
            return grant.options === 'any'
                ? `выбрать ${grant.count} из любых навыков`
                : `выбрать ${grant.count} из: ${labelList(SKILL_LABELS, grant.options) || '—'}`;
        case 'expertise-choice':
            return grant.options
                ? `выбрать ${grant.count} из: ${labelList(SKILL_LABELS, grant.options) || '—'}`
                : `выбрать ${grant.count} из освоенных навыков`;
        case 'tool-fixed':
            return grant.tools.join(', ') || '—';
        case 'tool-choice':
            return `выбрать ${grant.count} из: ${grant.options.join(', ') || '—'}`;
        case 'language-fixed':
            return labelList(LANGUAGE_LABELS, grant.languages) || '—';
        case 'language-choice':
            return grant.options
                ? `выбрать ${grant.count} из: ${labelList(LANGUAGE_LABELS, grant.options) || '—'}`
                : `выбрать ${grant.count} из любых языков`;
        case 'speed':
            return `${grant.value} футов`;
        case 'saving-throw':
            return labelList(STAT_LABELS, grant.stats) || '—';
        case 'trait':
            return grant.name || grant.id || '—';
        case 'armor-prof':
            return labelList(ARMOR_PROF_LABELS, grant.armors) || '—';
        case 'weapon-prof':
            return [
                ...grant.weapons.map((w) => labelOf(WEAPON_PROF_LABELS, w)),
                ...(grant.specific ?? []),
            ].filter(Boolean).join(', ') || '—';
        case 'spellcasting': {
            const parts = [
                labelOf(STAT_LABELS, grant.ability),
                labelOf(CASTER_TYPE_LABELS, grant.casterType),
            ];
            if (grant.progression) parts.push(labelOf(CASTER_PROGRESSION_LABELS, grant.progression));
            return parts.join(' · ');
        }
        case 'hp-die':
            return `d${grant.die}`;
        case 'resource': {
            const max = grant.max ?? grant.maxExpr;
            return `${grant.name || grant.id || '—'}${max !== undefined ? ` (макс. ${max})` : ''}`;
        }
        case 'equipment-fixed':
            return grant.items.join(', ') || '—';
        case 'equipment-choice':
            return pluralWithCount(grant.options.length, OPTION_FORMS);
        case 'gold':
            return `${grant.amount} зм`;
        case 'gold-dice':
            return grant.dice;
        case 'pick-one':
            return grant.label ?? pluralWithCount(grant.options.length, OPTION_FORMS);
        default:
            return '—';
    }
}
