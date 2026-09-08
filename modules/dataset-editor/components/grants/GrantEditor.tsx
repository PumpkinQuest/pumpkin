"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { Grant } from "../../lib/types";
import { listBonusTargetsByGroup, STAT_KEYS, SKILL_KEYS, ARMOR_PROF_KEYS, WEAPON_PROF_KEYS, COMMON_LANGUAGES } from "../../lib/registry/bonusTargets";
import { SENSE_TRAIT_IDS, SENSE_LABELS, SENSE_DEFAULT_RANGE, isSenseTraitId, isDefaultSenseName, type SenseTraitId } from "../../lib/registry/senses";
import { grantTypeLabel } from "../../lib/registry/grantLabels";
import {
    ARMOR_PROF_LABELS, CASTER_PROGRESSIONS, CASTER_PROGRESSION_LABELS, CASTER_TYPE_LABELS,
    FEAT_CATEGORIES, FEAT_CATEGORY_LABELS, LANGUAGE_LABELS, PREPARED_FORMULA_LABELS, SIZE_LABELS,
    SKILL_LABELS, STAT_LABELS, WEAPON_PROF_LABELS, labelOf,
} from "../../lib/registry/labels";
import GrantList from "./GrantList";

type Props = {
    grant: Grant;
    entityPath: string;
    /** Every `trait` grant across the whole entity — offered by ResourceForm's "pairs with" picker. */
    siblingTraits: Array<{ id: string; name: string }>;
    onChange: (grant: Grant) => void;
    onDelete: () => void;
    onClose: () => void;
};

export default function GrantEditor({ grant, siblingTraits, onChange, onDelete, onClose }: Props) {
    const setMany = useCallback((patch: Record<string, unknown>) => {
        onChange({ ...(grant as unknown as Record<string, unknown>), ...patch } as unknown as Grant);
    }, [grant, onChange]);

    const set = useCallback((key: string, value: unknown) => {
        setMany({ [key]: value });
    }, [setMany]);

    return (
        <div className="rounded-lg border border-pumpkin-orange/40 bg-pumpkin-orange/5 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-pumpkin-orange/20">
                <span className="text-xs font-medium text-pumpkin-orange">
                    {grantTypeLabel(grant.type)}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onClose}
                        className="px-2 py-0.5 rounded text-xs bg-pumpkin-orange text-pumpkin-bg font-medium"
                    >
                        Готово
                    </button>
                    <button onClick={onDelete} className="p-0.5 text-pumpkin-muted hover:text-red-400">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            <div className="p-3 flex flex-col gap-2">
                <GrantForm data={grant as unknown as Record<string, unknown>} set={set} setMany={setMany} siblingTraits={siblingTraits} />
            </div>
        </div>
    );
}

// ── Grant form dispatcher ─────────────────────────────────────────────────

function GrantForm({ data, set, setMany, siblingTraits }: {
    data: Record<string, unknown>;
    set: (k: string, v: unknown) => void;
    setMany: (patch: Record<string, unknown>) => void;
    siblingTraits: Array<{ id: string; name: string }>;
}) {
    const type = data.type as string;
    switch (type) {
        case 'asi-fixed': return <AsiFixedForm data={data} set={set} />;
        case 'asi-flexible': return <AsiFlexibleForm data={data} set={set} />;
        case 'asi-pool': return <AsiPoolForm data={data} set={set} />;
        case 'bonus': return <BonusForm data={data} set={set} />;
        case 'feat': return <FeatGrantForm data={data} set={set} />;
        case 'skill-fixed': return <SkillFixedForm data={data} set={set} />;
        case 'skill-choice': return <SkillChoiceForm data={data} set={set} />;
        case 'expertise-choice': return <ExpertiseChoiceForm data={data} set={set} />;
        case 'tool-fixed': return <ToolFixedForm data={data} set={set} />;
        case 'tool-choice': return <ToolChoiceForm data={data} set={set} />;
        case 'language-fixed': return <LanguageFixedForm data={data} set={set} />;
        case 'language-choice': return <LanguageChoiceForm data={data} set={set} />;
        case 'speed': return <SpeedForm data={data} set={set} />;
        case 'saving-throw': return <SavingThrowForm data={data} set={set} />;
        case 'trait': return <TraitForm data={data} set={set} setMany={setMany} />;
        case 'armor-prof': return <ArmorProfForm data={data} set={set} />;
        case 'weapon-prof': return <WeaponProfForm data={data} set={set} />;
        case 'spellcasting': return <SpellcastingForm data={data} set={set} />;
        case 'spell-fixed': return <SpellFixedForm data={data} set={set} />;
        case 'spell-choice': return <SpellChoiceForm data={data} set={set} />;
        case 'hp-die': return <HpDieForm data={data} set={set} />;
        case 'size': return <SizeForm data={data} set={set} />;
        case 'resource': return <ResourceForm data={data} set={set} setMany={setMany} siblingTraits={siblingTraits} />;
        case 'equipment-fixed': return <EquipmentFixedForm data={data} set={set} />;
        case 'equipment-choice': return <EquipmentChoiceForm data={data} set={set} />;
        case 'gold': return <GoldForm data={data} set={set} />;
        case 'gold-dice': return <GoldDiceForm data={data} set={set} />;
        case 'pick-one': return <PickOneForm data={data} set={set} siblingTraits={siblingTraits} />;
        default:     return <div className="text-xs text-red-400">Неизвестный тип гранта: {type}</div>;
    }
}

// ── Shared mini-components ────────────────────────────────────────────────

function F({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[11px] text-pumpkin-muted">{label}</label>
            {children}
        </div>
    );
}

const inputClass = "w-full rounded-md border border-pumpkin-border bg-pumpkin-bg px-2 py-1.5 text-xs text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50";

function TF({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <F label={label}>
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
        </F>
    );
}

function NF({ label, value, onChange, placeholder }: { label: string; value: number | undefined; onChange: (v: number | undefined) => void; placeholder?: string }) {
    return (
        <F label={label}>
            <input
                type="number"
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                placeholder={placeholder}
                className={inputClass}
            />
        </F>
    );
}

/**
 * Toggle chips over a closed key set. `labels` maps the stored key to what the
 * author reads — the keys themselves are the sheet's contract and stay as-is
 * (dataset-editor-guide.md §5.4), but nobody should have to recognise
 * `'sleight of hand'` or `'armor-label'` on screen.
 */
function MultiSelect({ label, options, selected, onChange, labels }: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (v: string[]) => void;
    labels?: Record<string, string>;
}) {
    return (
        <F label={label}>
            <div className="flex flex-wrap gap-1">
                {options.map((opt) => {
                    const on = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => onChange(on ? selected.filter((s) => s !== opt) : [...selected, opt])}
                            className={`px-1.5 py-0.5 rounded text-[11px] border transition-colors ${
                                on
                                    ? 'border-pumpkin-orange/40 bg-pumpkin-orange/10 text-pumpkin-orange'
                                    : 'border-pumpkin-border bg-pumpkin-bg text-pumpkin-muted hover:border-pumpkin-orange/20'
                            }`}
                        >
                            {labels ? labelOf(labels, opt) : opt}
                        </button>
                    );
                })}
            </div>
        </F>
    );
}

function CommaListField({ label, value, onChange, placeholder }: {
    label: string;
    value: string[];
    onChange: (v: string[]) => void;
    placeholder?: string;
}) {
    const [text, setText] = useState(value.join(', '));
    const [focused, setFocused] = useState(false);

    // Re-sync from the prop when it changes externally (e.g. a sibling row
    // shifting index after deletion) — but only while the user isn't typing,
    // so we don't clobber in-progress edits.
    useEffect(() => {
        if (!focused) setText(value.join(', '));
    }, [value, focused]);

    const commit = () => {
        setFocused(false);
        const next = text.split(',').map((s) => s.trim()).filter(Boolean);
        onChange(next);
        setText(next.join(', '));
    };

    return (
        <F label={label}>
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={commit}
                className={inputClass}
                placeholder={placeholder}
            />
        </F>
    );
}

// ── Grant type forms ──────────────────────────────────────────────────────

function AsiFixedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const values = (data.values as Record<string, number>) ?? {};
    return (
        <div className="flex flex-col gap-2">
            <span className="text-[11px] text-pumpkin-muted">Характеристики</span>
            {STAT_KEYS.map((stat) => (
                <div key={stat} className="flex items-center gap-2">
                    <span className="text-xs text-pumpkin-muted w-8">{labelOf(STAT_LABELS, stat)}</span>
                    <input
                        type="number"
                        value={values[stat] ?? ''}
                        onChange={(e) => {
                            const v = e.target.value === '' ? undefined : Number(e.target.value);
                            const next = { ...values };
                            if (v === undefined || v === 0) delete next[stat];
                            else next[stat] = v;
                            set('values', next);
                        }}
                        className="w-16 rounded-md border border-pumpkin-border bg-pumpkin-bg px-2 py-1 text-xs text-pumpkin-text focus:outline-none focus:border-pumpkin-orange/50"
                        placeholder="0"
                    />
                </div>
            ))}
        </div>
    );
}

function AsiFlexibleForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const sets = (data.sets as Array<{ count: number; amount: number; options?: string[] }>) ?? [];
    return (
        <div className="flex flex-col gap-2">
            {sets.map((s, i) => (
                <div key={i} className="flex items-center gap-2 border border-pumpkin-border rounded-md p-2">
                    <NF label="" value={s.count} onChange={(v) => {
                        const next = [...sets];
                        next[i] = { ...next[i], count: v ?? 0 };
                        set('sets', next);
                    }} />
                    <span className="text-xs text-pumpkin-muted">×</span>
                    <NF label="" value={s.amount} onChange={(v) => {
                        const next = [...sets];
                        next[i] = { ...next[i], amount: v ?? 0 };
                        set('sets', next);
                    }} />
                    <button onClick={() => set('sets', sets.filter((_, j) => j !== i))} className="text-xs text-red-400 ml-auto">
                        ×
                    </button>
                </div>
            ))}
            <button onClick={() => set('sets', [...sets, { count: 1, amount: 2 }])} className="text-xs text-pumpkin-muted hover:text-pumpkin-text">
                + Набор
            </button>
        </div>
    );
}

function AsiPoolForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const options = (data.options as string[]) ?? [];
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <NF label="Всего" value={data.total as number} onChange={(v) => set('total', v)} />
                <NF label="Макс на хар-ку" value={data.max as number} onChange={(v) => set('max', v)} />
            </div>
            <MultiSelect label="Варианты" options={[...STAT_KEYS]} selected={options} onChange={(v) => set('options', v)} labels={STAT_LABELS} />
        </div>
    );
}

function BonusForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const groups = listBonusTargetsByGroup();
    const target = (data.target as string) ?? '';
    return (
        <div className="flex flex-col gap-2">
            <F label="Цель">
                <select value={target} onChange={(e) => set('target', e.target.value)} className={inputClass}>
                    <option value="">— цель —</option>
                    {Object.entries(groups).map(([group, targets]) => (
                        <optgroup key={group} label={group}>
                            {targets.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </F>
            <TF label="Метка" value={(data.label as string) ?? ''} onChange={(v) => set('label', v)} />
            <TF label="Значение или формула" value={(data.expr as string) ?? ''} onChange={(v) => set('expr', v || undefined)} placeholder="2 или [LVL]" />
            <F label="Режим">
                <select value={(data.mode as string) ?? 'add'} onChange={(e) => set('mode', e.target.value || undefined)} className={inputClass}>
                    <option value="add">добавить</option>
                    <option value="set">установить</option>
                    <option value="upgrade">улучшить</option>
                    <option value="downgrade">ухудшить</option>
                    <option value="multiply">умножить</option>
                </select>
            </F>
        </div>
    );
}

function FeatGrantForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <TF label="Черта (ID)" value={(data.featId as string) ?? ''} onChange={(v) => set('featId', v)} placeholder="any" />
            <F label="Категория">
                <select value={(data.category as string) ?? ''} onChange={(e) => set('category', e.target.value || undefined)} className={inputClass}>
                    <option value="">—</option>
                    {FEAT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{FEAT_CATEGORY_LABELS[c]}</option>
                    ))}
                </select>
            </F>
        </div>
    );
}

function SkillFixedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const skills = (data.skills as string[]) ?? [];
    return <MultiSelect label="Навыки" options={[...SKILL_KEYS]} selected={skills} onChange={(v) => set('skills', v)} labels={SKILL_LABELS} />;
}

function SkillChoiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const opts = data.options as string[] | 'any' | undefined;
    return (
        <div className="flex flex-col gap-2">
            <NF label="Количество" value={data.count as number} onChange={(v) => set('count', v)} />
            <F label="Варианты">
                <select
                    value={Array.isArray(opts) ? '_custom' : (opts === 'any' ? 'any' : '_custom')}
                    onChange={(e) => {
                        if (e.target.value === 'any') set('options', 'any');
                        else set('options', []);
                    }}
                    className={inputClass}
                >
                    <option value="any">любые</option>
                    <option value="_custom">свои...</option>
                </select>
            </F>
            {Array.isArray(opts) && (
                <MultiSelect label="Навыки" options={[...SKILL_KEYS]} selected={opts} onChange={(v) => set('options', v)} labels={SKILL_LABELS} />
            )}
        </div>
    );
}

function ExpertiseChoiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const opts = (data.options as string[] | undefined) ?? [];
    const restricted = data.options !== undefined;
    return (
        <div className="flex flex-col gap-2">
            <NF label="Количество" value={data.count as number} onChange={(v) => set('count', v)} />
            <F label="Варианты (оставьте пустым для любых навыков с владением)">
                <select
                    value={restricted ? '_custom' : '_any'}
                    onChange={(e) => {
                        if (e.target.value === '_any') set('options', undefined);
                        else set('options', []);
                    }}
                    className={inputClass}
                >
                    <option value="_any">любые (при наличии владения)</option>
                    <option value="_custom">ограничить...</option>
                </select>
            </F>
            {restricted && (
                <div className="flex flex-col gap-1">
                    <MultiSelect label="Навыки" options={[...SKILL_KEYS]} selected={opts} onChange={(v) => set('options', v)} labels={SKILL_LABELS} />
                    <span className="text-[11px] text-pumpkin-muted/70">
                        Игрок сможет выбрать только из навыков, которыми он уже владеет — этот список дополнительно сужает пул.
                    </span>
                </div>
            )}
        </div>
    );
}

function ToolFixedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const tools = (data.tools as string[]) ?? [];
    return (
        <div className="flex flex-col gap-2">
            <CommaListField
                label="Инструменты (через запятую)"
                value={tools}
                onChange={(v) => set('tools', v)}
                placeholder="thieves' tools, herbalism kit"
            />
        </div>
    );
}

function ToolChoiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const options = (data.options as string[]) ?? [];
    return (
        <div className="flex flex-col gap-2">
            <NF label="Количество" value={data.count as number} onChange={(v) => set('count', v)} />
            <CommaListField
                label="Варианты (через запятую)"
                value={options}
                onChange={(v) => set('options', v)}
                placeholder="thieves' tools, herbalism kit"
            />
        </div>
    );
}

function LanguageFixedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const langs = (data.languages as string[]) ?? [];
    return <MultiSelect label="Языки" options={[...COMMON_LANGUAGES]} selected={langs} onChange={(v) => set('languages', v)} labels={LANGUAGE_LABELS} />;
}

function LanguageChoiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const options = data.options as string[] | undefined;
    return (
        <div className="flex flex-col gap-2">
            <NF label="Количество" value={data.count as number} onChange={(v) => set('count', v)} />
            {options && (
                <MultiSelect label="Варианты" options={[...COMMON_LANGUAGES]} selected={options} onChange={(v) => set('options', v)} labels={LANGUAGE_LABELS} />
            )}
        </div>
    );
}

function SpeedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return <NF label="Скорость (фт)" value={data.value as number} onChange={(v) => set('value', v)} />;
}

function SavingThrowForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const stats = (data.stats as string[]) ?? [];
    return <MultiSelect label="Спасброски" options={[...STAT_KEYS]} selected={stats} onChange={(v) => set('stats', v)} labels={STAT_LABELS} />;
}

function TraitForm({ data, set, setMany }: {
    data: Record<string, unknown>;
    set: (k: string, v: unknown) => void;
    setMany: (patch: Record<string, unknown>) => void;
}) {
    const id = (data.id as string) ?? '';
    const params = (data.params as Record<string, number> | undefined) ?? {};
    // A sense is the id AND a range together — that's exactly what the sheet
    // reads (`isSenseGrant` in the LSS wizard). Deciding on the id alone would
    // make «обычная черта» unselectable for a grant whose id happens to be a
    // sense: dropping `params` leaves the id behind, and the select would snap
    // straight back to the sense on the next render.
    const sense = isSenseTraitId(id) && typeof params.range === 'number' ? id : null;

    // ONE `setMany`, never a `set` per key: each `set` rebuilds the patch from
    // this render's grant, so a run of them collapses to the last one — which is
    // how switching «тёмное зрение» → «слепое зрение» used to write the range and
    // silently drop the new id and name, snapping the select back.
    const handleSenseChange = (next: string): void => {
        if (next === '__custom__') {
            // Only the range goes: the id and name stay as editable text so the
            // author can turn a sense into a normal trait without retyping it.
            setMany({ params: undefined });
            return;
        }
        const name = (data.name as string) ?? '';
        setMany({
            id: next,
            // The author's own caption wins; our default one gets retranslated.
            name: name && !isDefaultSenseName(name) ? name : SENSE_LABELS[next as SenseTraitId],
            // A range already typed carries across the switch; a trait that had
            // none starts at the sense's own default (0 for everything but
            // darkvision — see SENSE_DEFAULT_RANGE). Nothing else survives:
            // `range` is the only params key any sheet reads.
            params: { range: params.range ?? SENSE_DEFAULT_RANGE[next as SenseTraitId] },
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <F label="Тип черты">
                <select
                    value={sense ?? '__custom__'}
                    onChange={(e) => handleSenseChange(e.target.value)}
                    className={inputClass}
                >
                    <option value="__custom__">обычная черта</option>
                    {SENSE_TRAIT_IDS.map((s) => (
                        <option key={s} value={s}>{SENSE_LABELS[s]} (чувство)</option>
                    ))}
                </select>
            </F>
            {sense ? (
                <div className="grid grid-cols-2 gap-2">
                    {/* The name is the block's title on the sheet, so it can't be
                        write-only: the drow's «Превосходное тёмное зрение» has to
                        be typeable here, and a custom one kept across a type
                        switch has to be visible enough to fix. */}
                    <TF
                        label="Название"
                        value={(data.name as string) ?? ''}
                        onChange={(v) => set('name', v)}
                        placeholder={SENSE_LABELS[sense]}
                    />
                    <F label={`Дистанция «${SENSE_LABELS[sense]}» (фт)`}>
                        <input
                            type="number"
                            value={params.range ?? SENSE_DEFAULT_RANGE[sense]}
                            onChange={(e) => set('params', { ...params, range: Number(e.target.value) })}
                            className={inputClass}
                        />
                    </F>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    <TF label="Идентификатор" value={id} onChange={(v) => set('id', v)} placeholder="second-wind" />
                    <TF
                        label="Название"
                        value={(data.name as string) ?? ''}
                        onChange={(v) => set('name', v)}
                        placeholder="[f:1d10+[LVL]|Второе дыхание]"
                    />
                </div>
            )}
            <F label="Описание (поддерживает [f:...]-формулы)">
                <textarea
                    value={(data.description as string) ?? ''}
                    onChange={(e) => set('description', e.target.value || undefined)}
                    className={inputClass + ' min-h-[80px] resize-y'}
                    placeholder="Текст описания. Кость пишется так: [f:1d10+[LVL]] — она отразится и в свёрнутом спойлере, и в развёрнутом тексте."
                />
            </F>
            <div className="rounded-md border border-pumpkin-orange/20 bg-pumpkin-orange/5 p-2 flex flex-col gap-1">
                <span className="text-[11px] font-medium text-pumpkin-orange">[f:...] — формулы с костями</span>
                <code className="text-[11px] text-pumpkin-muted/80 leading-relaxed">
                    [f:1d10+[LVL]|Второе дыхание]&nbsp;&nbsp;— кость с лейблом<br />
                    [f:8+[CON]+[PROF]|Сл]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— DC с лейблом «Сл»<br />
                    [f:(ceil([LVL]/2))d6]&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;— кость без лейбла
                </code>
            </div>
        </div>
    );
}

function ArmorProfForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const armors = (data.armors as string[]) ?? [];
    return <MultiSelect label="Владение бронёй" options={[...ARMOR_PROF_KEYS]} selected={armors} onChange={(v) => set('armors', v)} labels={ARMOR_PROF_LABELS} />;
}

function WeaponProfForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const weapons = (data.weapons as string[]) ?? [];
    const specific = (data.specific as string[]) ?? [];
    return (
        <div className="flex flex-col gap-2">
            <MultiSelect label="Категории оружия" options={[...WEAPON_PROF_KEYS]} selected={weapons} onChange={(v) => set('weapons', v)} labels={WEAPON_PROF_LABELS} />
            <CommaListField
                label="Особое оружие (через запятую)"
                value={specific}
                onChange={(v) => set('specific', v)}
                placeholder="longsword, shortbow"
            />
        </div>
    );
}

function SpellcastingForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const casterType = (data.casterType as string) ?? 'list';
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <F label="Характеристика">
                    <select value={(data.ability as string) ?? 'int'} onChange={(e) => set('ability', e.target.value)} className={inputClass}>
                        <option value="int">ИНТ</option>
                        <option value="wis">МДР</option>
                        <option value="cha">ХАР</option>
                    </select>
                </F>
                <F label="Тип заклинателя">
                    <select value={casterType} onChange={(e) => set('casterType', e.target.value)} className={inputClass}>
                        {Object.entries(CASTER_TYPE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </F>
                <F label="Прогрессия">
                    <select value={(data.progression as string) ?? ''} onChange={(e) => set('progression', e.target.value || undefined)} className={inputClass}>
                        <option value="">—</option>
                        {CASTER_PROGRESSIONS.map((p) => (
                            <option key={p} value={p}>{CASTER_PROGRESSION_LABELS[p]}</option>
                        ))}
                    </select>
                </F>
                <TF
                    label="Список заклинаний (id класса, если не свой)"
                    value={(data.spellList as string) ?? ''}
                    onChange={(v) => set('spellList', v || undefined)}
                    placeholder="wizard"
                />
            </div>

            <SlotsByLevelField
                value={data.slotsByLevel as number[][] | undefined}
                onChange={(v) => set('slotsByLevel', v)}
            />

            <LevelArrayField
                label="Заговоры по уровням (cantripsByLevel)"
                value={data.cantripsByLevel as number[] | undefined}
                onChange={(v) => set('cantripsByLevel', v)}
            />
            <LevelArrayField
                label="Известные заклинания по уровням (knownByLevel)"
                hint="Приоритетнее preparedFormula — если задано оба, таблица побеждает."
                value={data.knownByLevel as number[] | undefined}
                onChange={(v) => set('knownByLevel', v)}
            />

            <F label="Формула подготовленных (preparedFormula)">
                <select value={(data.preparedFormula as string) ?? ''} onChange={(e) => set('preparedFormula', e.target.value || undefined)} className={inputClass}>
                    <option value="">—</option>
                    {Object.entries(PREPARED_FORMULA_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </F>

            {casterType === 'book' && (
                <div className="grid grid-cols-2 gap-2">
                    <NF label="Книга: на 1-м уровне" value={data.bookAtFirst as number} onChange={(v) => set('bookAtFirst', v)} />
                    <NF label="Книга: за уровень" value={data.bookPerLevel as number} onChange={(v) => set('bookPerLevel', v)} />
                </div>
            )}
        </div>
    );
}

/** 1..20 — character levels shown to the author; index 0 (the schema's stub) is kept in the stored array but hidden from the form. */
const CASTER_LEVELS = Array.from({ length: 20 }, (_, i) => i + 1);
const SPELL_CIRCLES = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const smallNumInputClass = "w-full rounded border border-pumpkin-border bg-pumpkin-bg px-1 py-0.5 text-[10px] text-pumpkin-text text-center focus:outline-none focus:border-pumpkin-orange/50";

/**
 * A by-level number table, toggled on/off — undefined means "not authored"
 * (e.g. the class uses one of the four built-in progressions and needs no
 * cantrips/known table of its own), which is meaningfully different from an
 * authored table of zeros.
 */
function LevelArrayField({ label, hint, value, onChange }: {
    label: string;
    hint?: string;
    value: number[] | undefined;
    onChange: (v: number[] | undefined) => void;
}) {
    const enabled = value !== undefined;
    const row = value ?? Array(21).fill(0);
    return (
        <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1.5 text-[11px] text-pumpkin-muted">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onChange(e.target.checked ? Array(21).fill(0) : undefined)}
                    className="accent-pumpkin-orange size-3"
                />
                {label}
            </label>
            {hint && <span className="text-[10px] text-pumpkin-muted/70">{hint}</span>}
            {enabled && (
                <div className="grid grid-cols-10 gap-1">
                    {CASTER_LEVELS.map((lvl) => (
                        <div key={lvl} className="flex flex-col items-center gap-0.5">
                            <span className="text-[9px] text-pumpkin-muted/60">{lvl}</span>
                            <input
                                type="number"
                                value={row[lvl] ?? 0}
                                onChange={(e) => {
                                    const next = [...row];
                                    next[lvl] = Number(e.target.value) || 0;
                                    onChange(next);
                                }}
                                className={smallNumInputClass}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/** The 21×9 own-slot-table editor — same on/off convention as LevelArrayField. */
function SlotsByLevelField({ value, onChange }: {
    value: number[][] | undefined;
    onChange: (v: number[][] | undefined) => void;
}) {
    const enabled = value !== undefined;
    const rows = value ?? Array.from({ length: 21 }, () => Array(9).fill(0));

    const setCell = (lvl: number, circle: number, v: number): void => {
        const next = rows.map((r) => [...r]);
        while (next.length <= lvl) next.push(Array(9).fill(0));
        const row = [...(next[lvl] ?? Array(9).fill(0))];
        while (row.length < 9) row.push(0);
        row[circle - 1] = v;
        next[lvl] = row;
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1.5 text-[11px] text-pumpkin-muted">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onChange(e.target.checked ? Array.from({ length: 21 }, () => Array(9).fill(0)) : undefined)}
                    className="accent-pumpkin-orange size-3"
                />
                Своя таблица ячеек (slotsByLevel)
            </label>
            <span className="text-[10px] text-pumpkin-muted/70">
                Только когда ни одна из четырёх встроенных прогрессий не подходит. Приоритетнее прогрессии в числах, но не отменяет её.
            </span>
            {enabled && (
                <div className="overflow-x-auto">
                    <table className="text-[10px] border-collapse">
                        <thead>
                            <tr>
                                <th className="px-1 font-normal text-pumpkin-muted/60">ур.</th>
                                {SPELL_CIRCLES.map((c) => (
                                    <th key={c} className="px-1 font-normal text-pumpkin-muted/60">{c}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {CASTER_LEVELS.map((lvl) => (
                                <tr key={lvl}>
                                    <td className="px-1 text-center text-pumpkin-muted/60">{lvl}</td>
                                    {SPELL_CIRCLES.map((c) => (
                                        <td key={c} className="p-0.5">
                                            <input
                                                type="number"
                                                value={rows[lvl]?.[c - 1] ?? 0}
                                                onChange={(e) => setCell(lvl, c, Number(e.target.value) || 0)}
                                                className={smallNumInputClass + ' w-8'}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/** Shared by `spell-fixed`/`spell-choice` — "own counter, no slot spent" per §7 of the format. Under the hood the same channel as `resource`, so `per: 'short-rest'` gets the same partial-regain control as `ResourceGrant.shortRestRegain` — long rest has no such control yet. */
function SpellUsesField({ uses, onChange }: {
    uses: { count?: number; countExpr?: string; per?: string; shortRestRegain?: string } | undefined;
    onChange: (v: { count?: number; countExpr?: string; per: 'long-rest' | 'short-rest'; shortRestRegain?: string } | undefined) => void;
}) {
    const enabled = uses !== undefined;
    const per = (uses?.per as 'long-rest' | 'short-rest') ?? 'long-rest';
    return (
        <div className="flex flex-col gap-2 border border-pumpkin-border rounded-md p-2">
            <label className="flex items-center gap-1.5 text-[11px] text-pumpkin-muted">
                <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onChange(e.target.checked ? { per: 'long-rest' } : undefined)}
                    className="accent-pumpkin-orange size-3"
                />
                Свой счётчик применений (иначе платить можно только ячейками)
            </label>
            {enabled && (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <NF
                            label="Количество"
                            value={uses?.count}
                            onChange={(v) => onChange({ ...uses, per, count: v, countExpr: v !== undefined ? undefined : uses?.countExpr })}
                        />
                        <TF
                            label="или формула"
                            value={uses?.countExpr ?? ''}
                            onChange={(v) => onChange({ ...uses, per, countExpr: v || undefined, count: v ? undefined : uses?.count })}
                            placeholder="[PROF]"
                        />
                    </div>
                    <F label="Восстанавливается">
                        <select
                            value={per}
                            onChange={(e) => {
                                const nextPer = e.target.value as 'long-rest' | 'short-rest';
                                onChange({ ...uses, per: nextPer, shortRestRegain: nextPer === 'short-rest' ? uses?.shortRestRegain : undefined });
                            }}
                            className={inputClass}
                        >
                            <option value="long-rest">длинный отдых</option>
                            <option value="short-rest">короткий отдых</option>
                        </select>
                    </F>
                    {per === 'short-rest' && (
                        <TF
                            label="Сколько восстанавливает короткий отдых (пусто = весь запас)"
                            value={uses?.shortRestRegain ?? ''}
                            onChange={(v) => onChange({ ...uses, per, shortRestRegain: v || undefined })}
                            placeholder="1, [PROF], ceil([LVL]/2)"
                        />
                    )}
                </>
            )}
        </div>
    );
}

/** `withSlots`/`alwaysPrepared` checkboxes shared by `spell-fixed`/`spell-choice`. */
function SpellDeliveryFields({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return (
        <>
            <label className="flex items-center gap-1.5 text-xs text-pumpkin-muted">
                <input
                    type="checkbox"
                    checked={data.withSlots !== false}
                    onChange={(e) => set('withSlots', e.target.checked ? undefined : false)}
                    className="accent-pumpkin-orange size-3"
                />
                Можно доплатить ячейкой сверх счётчика
            </label>
            <label className="flex items-center gap-1.5 text-xs text-pumpkin-muted">
                <input
                    type="checkbox"
                    checked={!!data.alwaysPrepared}
                    onChange={(e) => set('alwaysPrepared', e.target.checked ? true : undefined)}
                    className="accent-pumpkin-orange size-3"
                />
                Всегда подготовлено, вне лимита
            </label>
        </>
    );
}

function SpellAbilityField({ value, onChange }: { value: string; onChange: (v: string | undefined) => void }) {
    return (
        <F label="Характеристика (пусто — наследует листовую)">
            <select value={value} onChange={(e) => onChange(e.target.value || undefined)} className={inputClass}>
                <option value="">—</option>
                {STAT_KEYS.map((s) => (
                    <option key={s} value={s}>{labelOf(STAT_LABELS, s)}</option>
                ))}
            </select>
        </F>
    );
}

function SpellFixedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return (
        <div className="flex flex-col gap-2">
            <TF label="Слаг заклинания" value={(data.slug as string) ?? ''} onChange={(v) => set('slug', v)} placeholder="hellish-rebuke" />
            <SpellAbilityField value={(data.ability as string) ?? ''} onChange={(v) => set('ability', v)} />
            <SpellUsesField uses={data.uses as { count?: number; countExpr?: string; per?: string } | undefined} onChange={(v) => set('uses', v)} />
            <SpellDeliveryFields data={data} set={set} />
        </div>
    );
}

function SpellChoiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const circle = data.circle as number | undefined;
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <NF label="Количество" value={data.count as number} onChange={(v) => set('count', v)} />
                <F label="Круг (0 — заговоры)">
                    <select
                        value={circle === undefined ? '' : String(circle)}
                        onChange={(e) => set('circle', e.target.value === '' ? undefined : Number(e.target.value))}
                        className={inputClass}
                    >
                        <option value="">—</option>
                        <option value="0">заговор</option>
                        {SPELL_CIRCLES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </F>
            </div>
            <TF label="Из чьего списка (id класса)" value={(data.spellList as string) ?? ''} onChange={(v) => set('spellList', v)} placeholder="wizard" />
            <SpellAbilityField value={(data.ability as string) ?? ''} onChange={(v) => set('ability', v)} />
            <SpellUsesField uses={data.uses as { count?: number; countExpr?: string; per?: string } | undefined} onChange={(v) => set('uses', v)} />
            <SpellDeliveryFields data={data} set={set} />
        </div>
    );
}

function HpDieForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return <NF label="Кость хитов" value={data.die as number} onChange={(v) => set('die', v)} />;
}

function SizeForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return (
        <F label="Размер">
            <select value={(data.value as string) ?? 'medium'} onChange={(e) => set('value', e.target.value)} className={inputClass}>
                {Object.entries(SIZE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </F>
    );
}

function ResourceForm({ data, set, setMany, siblingTraits }: {
    data: Record<string, unknown>;
    set: (k: string, v: unknown) => void;
    setMany: (patch: Record<string, unknown>) => void;
    siblingTraits: Array<{ id: string; name: string }>;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <TF label="Идентификатор" value={(data.id as string) ?? ''} onChange={(v) => set('id', v)} />
                <TF label="Название" value={(data.name as string) ?? ''} onChange={(v) => set('name', v)} />
            </div>

            <F label="К какой черте относится (pairId)">
                <select
                    value={data.pairId === null ? '__none__' : (data.pairId as string) ?? (data.id as string) ?? ''}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v === '__none__') set('pairId', null);
                        else if (v === (data.id as string)) set('pairId', undefined);
                        else set('pairId', v || undefined);
                    }}
                    className={inputClass}
                >
                    <option value="">— не выбрано —</option>
                    {siblingTraits.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                    ))}
                    <option value="__none__">описания нет — pairId: null</option>
                </select>
            </F>
            {siblingTraits.length === 0 && (
                <span className="text-[11px] text-amber-400/80">
                    У этой сущности пока нет черт (trait) — счётчик встанет в общую группу, а не под описанием. Добавьте черту с тем же названием или выберите «описания нет».
                </span>
            )}

            <TF label="Макс (число или формула)" value={(data.maxExpr as string) ?? ''} onChange={(v) => set('maxExpr', v || undefined)} placeholder="3 или [LVL]" />

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-pumpkin-muted">
                    <input
                        type="checkbox"
                        checked={!!data.isShortRest}
                        onChange={(e) => {
                            const checked = e.target.checked;
                            setMany(checked
                                ? { isShortRest: true }
                                : { isShortRest: undefined, shortRestRegain: undefined });
                        }}
                        className="accent-pumpkin-orange size-3"
                    />
                    Короткий отдых
                </label>
                <label className="flex items-center gap-1.5 text-xs text-pumpkin-muted">
                    <input
                        type="checkbox"
                        checked={!!data.isLongRest}
                        onChange={(e) => set('isLongRest', e.target.checked || undefined)}
                        className="accent-pumpkin-orange size-3"
                    />
                    Длинный отдых
                </label>
            </div>

            {!!data.isShortRest && (
                <TF
                    label="Сколько восстанавливает короткий отдых (пусто = весь запас)"
                    value={(data.shortRestRegain as string) ?? ''}
                    onChange={(v) => set('shortRestRegain', v || undefined)}
                    placeholder="1, [PROF], ceil([LVL]/2)"
                />
            )}

            <F label="Заметка">
                <textarea
                    value={(data.notes as string) ?? ''}
                    onChange={(e) => set('notes', e.target.value || undefined)}
                    className={inputClass + ' min-h-[50px] resize-y'}
                    placeholder="Правило, которое счётчик не выражает — кулдаун, «раз в ход», что покупает потраченное очко..."
                />
            </F>
        </div>
    );
}

function EquipmentFixedForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const items = (data.items as string[]) ?? [];
    return (
        <CommaListField
            label="Предметы (через запятую)"
            value={items}
            onChange={(v) => set('items', v)}
            placeholder="longsword, shield, explorer's pack"
        />
    );
}

function EquipmentChoiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    const options = (data.options as string[][]) ?? [];
    return (
        <div className="flex flex-col gap-2">
            <TF
                label="Идентификатор выбора (необязательно)"
                value={(data.id as string) ?? ''}
                onChange={(v) => set('id', v || undefined)}
                placeholder="starting-weapon"
            />
            {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] text-pumpkin-muted w-5">{i + 1}.</span>
                    <div className="flex-1">
                        <CommaListField
                            label=""
                            value={opt}
                            onChange={(v) => {
                                const next = [...options];
                                next[i] = v;
                                set('options', next);
                            }}
                            placeholder="longsword, shield"
                        />
                    </div>
                    <button onClick={() => set('options', options.filter((_, j) => j !== i))} className="text-xs text-red-400">
                        ×
                    </button>
                </div>
            ))}
            <button onClick={() => set('options', [...options, []])} className="text-xs text-pumpkin-muted hover:text-pumpkin-text">
                + Вариант
            </button>
        </div>
    );
}

function GoldForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return <NF label="Золото (зм)" value={data.amount as number} onChange={(v) => set('amount', v)} />;
}

function GoldDiceForm({ data, set }: { data: Record<string, unknown>; set: (k: string, v: unknown) => void }) {
    return <TF label="Формула кубов" value={(data.dice as string) ?? ''} onChange={(v) => set('dice', v)} placeholder="5d4*10" />;
}

function PickOneForm({ data, set, siblingTraits }: {
    data: Record<string, unknown>;
    set: (k: string, v: unknown) => void;
    siblingTraits: Array<{ id: string; name: string }>;
}) {
    const options = (data.options as Array<{ id?: string; label: string; grants: Grant[] }>) ?? [];
    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <TF label="Идентификатор" value={(data.id as string) ?? ''} onChange={(v) => set('id', v || undefined)} />
                <TF label="Заголовок" value={(data.label as string) ?? ''} onChange={(v) => set('label', v || undefined)} />
            </div>
            <span className="text-[11px] text-pumpkin-muted">Варианты</span>
            {options.map((opt, i) => (
                <div key={i} className="border border-pumpkin-border rounded-md p-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] text-pumpkin-muted w-5">{i + 1}.</span>
                        <input
                            value={opt.id ?? ''}
                            onChange={(e) => {
                                const next = [...options];
                                next[i] = { ...next[i], id: e.target.value || undefined };
                                set('options', next);
                            }}
                            className={inputClass + ' w-32'}
                            placeholder="option-id"
                        />
                        <input
                            value={opt.label}
                            onChange={(e) => {
                                const next = [...options];
                                next[i] = { ...next[i], label: e.target.value };
                                set('options', next);
                            }}
                            className={inputClass}
                            placeholder="Label"
                        />
                        <button onClick={() => set('options', options.filter((_, j) => j !== i))} className="text-xs text-red-400">
                            ×
                        </button>
                    </div>
                    <div className="ml-5">
                        <GrantList
                            grants={opt.grants ?? []}
                            entityPath={`pick-one/options[${i}]`}
                            siblingTraits={siblingTraits}
                            onChange={(g) => {
                                const next = [...options];
                                next[i] = { ...next[i], grants: g };
                                set('options', next);
                            }}
                        />
                    </div>
                </div>
            ))}
            <button
                onClick={() => set('options', [...options, { label: '', grants: [] }])}
                className="text-xs text-pumpkin-muted hover:text-pumpkin-text"
            >
                + Вариант
            </button>
        </div>
    );
}
