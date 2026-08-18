"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import type { Grant } from "../../lib/types";
import { grantTypeLabel } from "../../lib/registry/grantLabels";
import {
    ARMOR_PROF_LABELS, CASTER_PROGRESSION_LABELS, CASTER_TYPE_LABELS, LANGUAGE_LABELS,
    SIZE_LABELS, SKILL_LABELS, STAT_LABELS, WEAPON_PROF_LABELS, labelList, labelOf,
} from "../../lib/registry/labels";
import { isSenseTraitId } from "../../lib/registry/senses";
import { pluralWithCount } from "../../lib/plural";
import GrantEditor from "./GrantEditor";
import GrantPicker from "./GrantPicker";

type Props = {
    grants: Grant[];
    entityPath: string;
    /** Every `trait` grant across the whole entity — offered as the "pairs with" target when adding/editing a `resource` grant. */
    siblingTraits: Array<{ id: string; name: string }>;
    onChange: (grants: Grant[]) => void;
};

export default function GrantList({ grants, entityPath, siblingTraits, onChange }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [picking, setPicking] = useState(false);

    const handleStartAdd = useCallback(() => {
        setPicking(true);
    }, []);

    const handleCancelAdd = useCallback(() => {
        setPicking(false);
    }, []);

    /** A picker entry hands back a list, so this appends it and opens the first new row. */
    const handleAdd = useCallback((added: Grant[]) => {
        if (added.length === 0) return;
        const next = [...grants, ...added];
        onChange(next);
        setEditingIndex(grants.length);
        setPicking(false);
    }, [grants, onChange]);

    const handleGrantChange = useCallback((index: number, grant: Grant) => {
        const next = [...grants];
        next[index] = grant;
        onChange(next);
    }, [grants, onChange]);

    const handleCloseEdit = useCallback(() => setEditingIndex(null), []);

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
                            onChange={(g) => handleGrantChange(i, g)}
                            onClose={handleCloseEdit}
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
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-pumpkin-orange/10 text-pumpkin-orange shrink-0">
                            {typeLabel}
                        </span>
                        <span className="text-xs text-pumpkin-muted truncate flex-1">
                            {summary}
                        </span>
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
                    </div>
                );
            })}

            {/* Add grant picker */}
            {picking ? (
                <GrantPicker
                    siblingTraits={siblingTraits}
                    onPick={handleAdd}
                    onCancel={handleCancelAdd}
                />
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
            const amount = grant.expr || '?';
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
        case 'trait': {
            const name = grant.name || grant.id || '—';
            // Senses are the one trait whose `params` the sheet actually reads
            // (§5.5), so the distance belongs on the row — otherwise «Тёмное
            // зрение» looks the same whether it reaches 60 or 120 feet.
            if (isSenseTraitId(grant.id) && typeof grant.params?.range === 'number') {
                return `${name}, ${grant.params.range} фт`;
            }
            return name;
        }
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
            if (grant.spellList) parts.push(`список: ${grant.spellList}`);
            return parts.join(' · ');
        }
        case 'spell-fixed':
            return grant.slug || '—';
        case 'spell-choice':
            return `выбрать ${grant.count} круга ${grant.circle === 0 ? '0 (заговоры)' : grant.circle} из «${grant.spellList || '—'}»`;
        case 'hp-die':
            return `d${grant.die}`;
        case 'size':
            return labelOf(SIZE_LABELS, grant.value);
        case 'resource': {
            const max = grant.maxExpr;
            return `${grant.name || grant.id || '—'}${max ? ` (макс. ${max})` : ''}`;
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
