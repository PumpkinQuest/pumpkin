"use client";

import { useState, useCallback } from "react";
import { Plus, GripVertical, ChevronDown } from "lucide-react";
import type { Grant } from "../../lib/types";
import GrantEditor from "./GrantEditor";

type Props = {
    grants: Grant[];
    entityPath: string;
    onChange: (grants: Grant[]) => void;
    compact?: boolean;
};

const GRANT_TYPE_LABELS: Record<string, string> = {
    'asi-fixed': 'Характеристики (фикс)',
    'asi-flexible': 'Характеристики (выбор)',
    'asi-pool': 'Характеристики (пул)',
    'bonus': 'Бонус',
    'feat': 'Черта',
    'skill-fixed': 'Навыки (фикс)',
    'skill-choice': 'Навыки (выбор)',
    'tool-fixed': 'Инструменты (фикс)',
    'tool-choice': 'Инструменты (выбор)',
    'language-fixed': 'Языки (фикс)',
    'language-choice': 'Языки (выбор)',
    'speed': 'Скорость',
    'saving-throw': 'Спасбросок',
    'trait': 'Особенность',
    'armor-prof': 'Владение бронёй',
    'weapon-prof': 'Владение оружием',
    'spellcasting': 'Заклинания',
    'hp-die': 'Кость хитов',
    'resource': 'Ресурс',
    'equipment-fixed': 'Снаряжение (фикс)',
    'equipment-choice': 'Снаряжение (выбор)',
    'gold': 'Золото',
    'gold-dice': 'Золото (кубы)',
    'pick-one': 'Выбор одного',
};

const GRANT_TYPES = Object.keys(GRANT_TYPE_LABELS);

export default function GrantList({ grants, entityPath, onChange, compact }: Props) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [addingType, setAddingType] = useState<string | null>(null);

    const handleAdd = useCallback((type: string) => {
        const newGrant = makeDefaultGrant(type);
        const next = [...grants, newGrant];
        onChange(next);
        setEditingIndex(next.length - 1);
        setAddingType(null);
    }, [grants, onChange]);

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
                            onSave={(g) => handleUpdate(i, g)}
                            onCancel={() => setEditingIndex(null)}
                            onDelete={() => handleDelete(i)}
                        />
                    );
                }

                const typeLabel = GRANT_TYPE_LABELS[grant.type] ?? grant.type;
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-40 overflow-y-auto">
                        {GRANT_TYPES.map((type) => (
                            <button
                                key={type}
                                onClick={() => handleAdd(type)}
                                className="text-left px-2 py-1 rounded text-xs text-pumpkin-muted hover:bg-pumpkin-orange/10 hover:text-pumpkin-text transition-colors"
                            >
                                {GRANT_TYPE_LABELS[type]}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setAddingType(null)}
                        className="text-xs text-pumpkin-muted hover:text-pumpkin-text self-start"
                    >
                        Отмена
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setAddingType('_pick')}
                    className="flex items-center gap-1.5 text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors self-start py-1"
                >
                    <Plus size={14} />
                    Добавить грант
                </button>
            )}
        </div>
    );
}

function makeDefaultGrant(type: string): Grant {
    switch (type) {
        case 'asi-fixed': return { type: 'asi-fixed', values: {} };
        case 'asi-flexible': return { type: 'asi-flexible', sets: [] };
        case 'asi-pool': return { type: 'asi-pool', total: 3, max: 2, options: [] };
        case 'bonus': return { type: 'bonus', target: '', value: 0, label: '' };
        case 'feat': return { type: 'feat', featId: '' };
        case 'skill-fixed': return { type: 'skill-fixed', skills: [] };
        case 'skill-choice': return { type: 'skill-choice', count: 1, options: 'any' };
        case 'tool-fixed': return { type: 'tool-fixed', tools: [] };
        case 'tool-choice': return { type: 'tool-choice', count: 1, options: [] };
        case 'language-fixed': return { type: 'language-fixed', languages: [] };
        case 'language-choice': return { type: 'language-choice', count: 1 };
        case 'speed': return { type: 'speed', value: 30 };
        case 'saving-throw': return { type: 'saving-throw', stats: [] };
        case 'trait': return { type: 'trait', id: '', name: '' };
        case 'armor-prof': return { type: 'armor-prof', armors: [] };
        case 'weapon-prof': return { type: 'weapon-prof', weapons: [] };
        case 'spellcasting': return { type: 'spellcasting', ability: 'int', casterType: 'list' };
        case 'hp-die': return { type: 'hp-die', die: 8 };
        case 'resource': return { type: 'resource', id: '', name: '' };
        case 'equipment-fixed': return { type: 'equipment-fixed', items: [] };
        case 'equipment-choice': return { type: 'equipment-choice', options: [] };
        case 'gold': return { type: 'gold', amount: 0 };
        case 'gold-dice': return { type: 'gold-dice', dice: '5d4' };
        case 'pick-one': return { type: 'pick-one', options: [] };
        default: return { type: 'bonus', target: '', value: 0, label: '' } as Grant;
    }
}

function grantSummary(grant: Grant): string {
    switch (grant.type) {
        case 'asi-fixed': {
            const values = Object.entries(grant.values).filter(([, v]) => v !== undefined);
            return values.map(([k, v]) => `${k}+${v}`).join(', ') || '—';
        }
        case 'asi-flexible':
            return grant.sets.map((s) => `${s.count}×+${s.amount}`).join(', ') || '—';
        case 'asi-pool':
            return `${grant.total} pts, max ${grant.max}`;
        case 'bonus':
            return `${grant.target} ${grant.value ?? grant.expr ?? '?'} (${grant.label})`;
        case 'feat':
            return grant.featId;
        case 'skill-fixed':
            return grant.skills.join(', ');
        case 'skill-choice':
            return `pick ${grant.count} from ${grant.options === 'any' ? 'any' : grant.options.join(', ')}`;
        case 'tool-fixed':
            return grant.tools.join(', ');
        case 'tool-choice':
            return `pick ${grant.count} from ${grant.options.join(', ')}`;
        case 'language-fixed':
            return grant.languages.join(', ');
        case 'language-choice':
            return `pick ${grant.count}` + (grant.options ? ` from ${grant.options.join(', ')}` : '');
        case 'speed':
            return `${grant.value} ft`;
        case 'saving-throw':
            return grant.stats.join(', ');
        case 'trait':
            return grant.name || grant.id;
        case 'armor-prof':
            return grant.armors.join(', ');
        case 'weapon-prof':
            return [...grant.weapons, ...(grant.specific ?? [])].join(', ');
        case 'spellcasting':
            return `${grant.ability} / ${grant.casterType}` + (grant.progression ? ` (${grant.progression})` : '');
        case 'hp-die':
            return `d${grant.die}`;
        case 'resource':
            return `${grant.name} (${grant.max ?? grant.maxExpr ?? '?'})`;
        case 'equipment-fixed':
            return grant.items.join(', ');
        case 'equipment-choice':
            return `${grant.options.length} options`;
        case 'gold':
            return `${grant.amount} gp`;
        case 'gold-dice':
            return grant.dice;
        case 'pick-one':
            return grant.label ?? `${grant.options.length} options`;
        default:
            return '—';
    }
}
