"use client";

import { useState, useCallback, useMemo } from "react";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
import type { Dataset, Grant, LeveledGrants } from "../../lib/types";
import { STANDARD_CLASSES, STANDARD_RACES } from "../../lib/standardClasses";
import { STAT_KEYS } from "../../lib/registry/bonusTargets";
import InfoTooltip from "../common/InfoTooltip";
import GrantList from "../grants/GrantList";

type Kind = 'classes' | 'subclasses' | 'races' | 'subraces' | 'backgrounds' | 'feats';

type Props = {
    kind: Kind;
    entity: Record<string, unknown>;
    dataset: Dataset;
    errorPaths: Set<string>;
    warnPaths: Set<string>;
    onSave: (entity: Record<string, unknown>) => void;
    onDelete: () => void;
    onCancel: () => void;
};

export default function EntityEditor({ kind, entity, dataset, errorPaths, warnPaths, onSave, onDelete, onCancel }: Props) {
    const [data, setData] = useState<Record<string, unknown>>(structuredClone(entity));
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const update = useCallback((key: string, value: unknown) => {
        setData((prev) => ({ ...prev, [key]: value }));
    }, []);

    const entityPath = `${kind}/${(data as { id: string }).id}`;

    const grants = (data.grants as Grant[]) ?? [];
    const leveledGrants = (data.leveledGrants as LeveledGrants[] | undefined);

    const setGrants = useCallback((g: Grant[]) => update('grants', g), [update]);
    const setLeveled = useCallback((lg: LeveledGrants[]) => update('leveledGrants', lg), [update]);

    const classInfo = useMemo(
        () => (data.info as { primaryStats?: string[][]; complexity?: 0 | 1 | 2 } | undefined) ?? {},
        [data.info],
    );
    const infoRecord = useMemo(
        () => (data.info as Record<string, unknown> | undefined) ?? {},
        [data.info],
    );
    const updateInfo = useCallback(
        (patch: Record<string, unknown>) => {
            update('info', { ...infoRecord, ...patch });
        },
        [update, infoRecord],
    );
    const updateClassInfo = useCallback(
        (patch: Partial<{ primaryStats: string[][]; complexity: 0 | 1 | 2 }>) => {
            update('info', { primaryStats: [], complexity: 0, ...classInfo, ...patch });
        },
        [update, classInfo],
    );

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={onCancel} className="p-1 text-pumpkin-muted hover:text-pumpkin-text">
                    <ArrowLeft size={18} />
                </button>
                <span className="text-sm font-medium text-pumpkin-text">
                    {(data.label as string) || 'Новая сущность'}
                </span>
                <span className="text-xs text-pumpkin-muted font-mono">
                    {(data.id as string)}
                </span>
                {deleteConfirm ? (
                    <div className="flex items-center gap-1 ml-auto">
                        <button
                            onClick={onDelete}
                            className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                            Удалить
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(false)}
                            className="px-2 py-1 rounded text-xs text-pumpkin-muted hover:text-pumpkin-text"
                        >
                            Нет
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setDeleteConfirm(true)}
                        className="ml-auto p-1 text-pumpkin-muted hover:text-red-400 transition-colors"
                        title="Удалить"
                    >
                        <Trash2 size={15} />
                    </button>
                )}
            </div>

            {/* Entity fields */}
            <div className="grid grid-cols-2 gap-3">
                <Field
                    label="Идентификатор"
                    value={(data.id as string) ?? ''}
                    disabled
                    hint="Генерируется автоматически при создании и не меняется — на него ссылаются другие сущности датасета (classId у подкласса, raceId у подрасы, featId у гранта feat)."
                />
                <Field label="Название" value={(data.label as string) ?? ''} onChange={(v) => update('label', v)} />

                {kind === 'classes' && (
                    <>
                        <Field
                            label="Уровень подкласса"
                            value={String(data.subclassLevel ?? '')}
                            onChange={(v) => update('subclassLevel', v ? Number(v) : undefined)}
                            placeholder="3"
                            hint="Уровень персонажа, на котором игрок выбирает подкласс для этого класса (например, у волшебника — 2, у варвара — 3)."
                        />
                        <Field
                            label="Предпочтения"
                            value={(data.likes as string) ?? ''}
                            onChange={(v) => update('likes', v || undefined)}
                            placeholder="Скрытность"
                            hint="Краткое описание в одно слово. В визарде отобразиться как 'Любит скрытность'"
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                                Сложность игры за класс
                                <InfoTooltip text="Только подсказка для игрока при выборе класса — не влияет на механику." />
                            </label>
                            <select
                                value={String(classInfo.complexity ?? 0)}
                                onChange={(e) => updateClassInfo({ complexity: Number(e.target.value) as 0 | 1 | 2 })}
                                className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text focus:outline-none focus:border-pumpkin-orange/50"
                            >
                                <option value="0">Низкая</option>
                                <option value="1">Средняя</option>
                                <option value="2">Высокая</option>
                            </select>
                        </div>
                    </>
                )}
                {kind === 'subclasses' && (
                    <>
                        <SubclassClassPicker
                            value={(data.classId as string) ?? ''}
                            dataset={dataset}
                            onChange={(v) => update('classId', v)}
                        />
                        <Field
                            label="Тэглайн"
                            value={(infoRecord.tagline as string) ?? ''}
                            onChange={(v) => updateInfo({ tagline: v || undefined })}
                            placeholder="Короткое описание подкласса"
                            hint="Короткая фраза-описание, показывается в карточке выбора рядом с названием. Не влияет на механику."
                        />
                    </>
                )}
                {kind === 'subraces' && (
                    <>
                        <SubraceRacePicker
                            value={(data.raceId as string) ?? ''}
                            dataset={dataset}
                            onChange={(v) => update('raceId', v)}
                        />
                        <Field
                            label="Тэглайн"
                            value={(infoRecord.tagline as string) ?? ''}
                            onChange={(v) => updateInfo({ tagline: v || undefined })}
                            placeholder="Короткое описание подрасы"
                            hint="Короткая фраза-описание, показывается в карточке выбора рядом с названием. Не влияет на механику."
                        />
                    </>
                )}
                {kind === 'races' && (
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                            Размер
                            <InfoTooltip text="Влияет на игровые правила размера персонажа: грузоподъёмность, занимаемое пространство и т.п." />
                        </label>
                        <select
                            value={(data.size as string) ?? 'medium'}
                            onChange={(e) => update('size', e.target.value)}
                            className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text focus:outline-none focus:border-pumpkin-orange/50"
                        >
                            <option value="small">Маленький</option>
                            <option value="medium">Средний</option>
                            <option value="large">Большой</option>
                        </select>
                    </div>
                )}
                {kind === 'feats' && (
                    <>
                        <FeatCategoryPicker
                            value={(data.category as string) ?? ''}
                            onChange={(v) => update('category', v || undefined)}
                        />
                        <Field
                            label="Пререквизит"
                            value={(data.prerequisite as string) ?? ''}
                            onChange={(v) => update('prerequisite', v || undefined)}
                            placeholder="например: Ловкость 13+"
                            hint="Текст-условие для игрока (например «Ловкость 13 или выше»). Не проверяется автоматически — это просто подсказка в описании черты."
                        />
                    </>
                )}
            </div>

            {/* Class-only: primary stats */}
            {kind === 'classes' && (
                <PrimaryStatsEditor
                    groups={classInfo.primaryStats ?? []}
                    onChange={(groups) => updateClassInfo({ primaryStats: groups })}
                />
            )}

            {/* Subclass/subrace/race-only: tags */}
            {(kind === 'subclasses' || kind === 'subraces' || kind === 'races') && (
                <TagsEditor
                    label="Теги"
                    tags={(infoRecord.tags as string[] | undefined) ?? []}
                    onChange={(tags) => updateInfo({ tags })}
                    hint="Свободные метки для фильтрации и отображения в билдере (например: «мили», «магия», «скрытность»). Не влияют на механику."
                />
            )}

            {/* Grants */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-pumpkin-text flex items-center gap-2">
                    Гранты
                    <InfoTooltip text="Гранты — атомарные механические эффекты, которые сущность даёт персонажу: бонусы к характеристикам, владения навыками/оружием/бронёй, спасброски, черты, ресурсы, заклинания и т.д. Вся механика класса/расы/предыстории/черты описывается через список грантов." />
                    {(() => {
                        const prefix = `${entityPath}/grants`;
                        const errs = Array.from(errorPaths).filter((p) => p.startsWith(prefix)).length;
                        const warns = Array.from(warnPaths).filter((p) => p.startsWith(prefix)).length;
                        if (errs > 0) {
                            return <span className="text-xs text-red-400">({errs} ошибок)</span>;
                        }
                        if (warns > 0) {
                            return <span className="text-xs text-amber-400">({warns} предупреждений)</span>;
                        }
                        return null;
                    })()}
                </h3>
                <GrantList
                    grants={grants}
                    entityPath={entityPath}
                    onChange={setGrants}
                />
            </div>

            {/* Leveled grants (classes/subclasses) */}
            {(kind === 'classes' || kind === 'subclasses') && leveledGrants !== undefined && (
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold text-pumpkin-text flex items-center gap-1">
                        Гранты по уровням
                        <InfoTooltip text="Дополнительные гранты, которые применяются только начиная с указанного уровня персонажа — так описывается прогрессия классов/подклассов по уровням." />
                    </h3>
                    <LeveledGrantsEditor
                        leveledGrants={leveledGrants}
                        entityPath={entityPath}
                        onChange={setLeveled}
                    />
                </div>
            )}

            {/* Save */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onSave(data)}
                    className="px-4 py-2 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim text-pumpkin-bg font-semibold text-sm transition-colors"
                >
                    Сохранить
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 py-2 rounded-lg border border-pumpkin-border text-pumpkin-muted hover:text-pumpkin-text text-sm transition-colors"
                >
                    Отмена
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

// ── Subclass class picker ────────────────────────────────────────────────

const CUSTOM_CLASS_VALUE = '__custom__';

function SubclassClassPicker({ value, dataset, onChange }: {
    value: string;
    dataset: Dataset;
    onChange: (v: string) => void;
}) {
    const datasetClasses = dataset.classes ?? [];
    const classOptions = [
        ...datasetClasses.map((c) => ({ id: c.id, label: c.label || c.id, source: 'датасет' })),
        ...STANDARD_CLASSES.filter((sc) => !datasetClasses.some((c) => c.id === sc.id))
            .map((sc) => ({ id: sc.id, label: sc.label, source: 'стандартный' })),
    ];
    const knownIds = useMemo(() => new Set(classOptions.map((c) => c.id)), [classOptions]);
    const [isCustom, setIsCustom] = useState(() => Boolean(value) && !knownIds.has(value));

    const handleSelectChange = (raw: string) => {
        if (raw === CUSTOM_CLASS_VALUE) {
            setIsCustom(true);
            onChange('');
            return;
        }
        setIsCustom(false);
        onChange(raw);
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                Класс
                <InfoTooltip text="Класс, к которому относится подкласс. Подкласс появится в билдере, только если этот id совпадает с id класса в датасете (или со стандартным SRD-классом)." />
            </label>
            <select
                value={isCustom ? CUSTOM_CLASS_VALUE : value}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text focus:outline-none focus:border-pumpkin-orange/50"
            >
                <option value="">— выберите класс —</option>
                {classOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.label} ({c.source})
                    </option>
                ))}
                <option value={CUSTOM_CLASS_VALUE}>— свой вариант —</option>
            </select>
            {isCustom && (
                <Field
                    label="Свой класс"
                    value={value}
                    onChange={onChange}
                    placeholder="artificer"
                    hint="Слаг на английском в нижнем регистре через дефис, без пробелов и заглавных букв (например artificer). Должен точно совпадать с id класса — своего, из другого датасета или стандартного SRD-класса, — иначе подкласс будет считаться ошибкой и не появится в билдере."
                />
            )}
        </div>
    );
}

// ── Subrace race picker ──────────────────────────────────────────────────

const CUSTOM_RACE_VALUE = '__custom__';

function SubraceRacePicker({ value, dataset, onChange }: {
    value: string;
    dataset: Dataset;
    onChange: (v: string) => void;
}) {
    const datasetRaces = dataset.races ?? [];
    const options = [
        ...datasetRaces.map((r) => ({ id: r.id, label: r.label || r.id, source: 'датасет' })),
        ...STANDARD_RACES.filter((sr) => !datasetRaces.some((r) => r.id === sr.id))
            .map((sr) => ({ id: sr.id, label: sr.label, source: 'стандартный' })),
    ];
    const knownIds = useMemo(() => new Set(options.map((o) => o.id)), [options]);
    const [isCustom, setIsCustom] = useState(() => Boolean(value) && !knownIds.has(value));

    const handleSelectChange = (raw: string) => {
        if (raw === CUSTOM_RACE_VALUE) {
            setIsCustom(true);
            onChange('');
            return;
        }
        setIsCustom(false);
        onChange(raw);
    };

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                Раса
                <InfoTooltip text="Раса, к которой относится подраса. Подраса появится в билдере, только если этот id совпадает с id расы в датасете (или со стандартной SRD-расой)." />
            </label>
            <select
                value={isCustom ? CUSTOM_RACE_VALUE : value}
                onChange={(e) => handleSelectChange(e.target.value)}
                className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text focus:outline-none focus:border-pumpkin-orange/50"
            >
                <option value="">— выберите расу —</option>
                {options.map((o) => (
                    <option key={o.id} value={o.id}>
                        {o.label} ({o.source})
                    </option>
                ))}
                <option value={CUSTOM_RACE_VALUE}>— свой вариант —</option>
            </select>
            {isCustom && (
                <Field
                    label="Своя раса"
                    value={value}
                    onChange={onChange}
                    placeholder="aasimar"
                    hint="Слаг на английском в нижнем регистре через дефис, без пробелов и заглавных букв (например aasimar). Должен точно совпадать с id расы — своей, из другого датасета или стандартной SRD-расы, — иначе подраса будет считаться ошибкой и не появится в билдере."
                />
            )}
        </div>
    );
}

// ── Feat category picker ─────────────────────────────────────────────────

const FEAT_CATEGORIES = [
    { value: 'origin', label: 'Происхождение' },
    { value: 'general', label: 'Общая' },
    { value: 'fighting-style', label: 'Боевой стиль' },
    { value: 'epic-boon', label: 'Эпический дар' },
    { value: 'invocation', label: 'Инвокация' },
];

function FeatCategoryPicker({ value, onChange }: {
    value: string;
    onChange: (v: string | undefined) => void;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                Категория
                <InfoTooltip text="Группа черты по правилам — влияет на то, в каком списке выбора черта будет доступна игроку (общие черты, боевые стили, эпические дары и т.д.)." />
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value || undefined)}
                className="w-full rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text focus:outline-none focus:border-pumpkin-orange/50"
            >
                <option value="">— без категории —</option>
                {FEAT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                ))}
            </select>
        </div>
    );
}

// ── Primary stats editor (classes) ───────────────────────────────────────
// `primaryStats` is `string[][]`: stats inside one group are combined with
// "AND" — all of them matter together (e.g. Monk's DEX *and* WIS live in one
// group). Separate groups are combined with "OR" — alternative builds
// (e.g. Fighter's STR *or* DEX are two groups, one stat each).

function PrimaryStatsEditor({ groups, onChange }: {
    groups: string[][];
    onChange: (groups: string[][]) => void;
}) {
    const addGroup = useCallback(() => {
        onChange([...groups, []]);
    }, [groups, onChange]);

    const removeGroup = useCallback((idx: number) => {
        onChange(groups.filter((_, i) => i !== idx));
    }, [groups, onChange]);

    const toggleStat = useCallback((idx: number, stat: string) => {
        const group = groups[idx] ?? [];
        const next = group.includes(stat) ? group.filter((s) => s !== stat) : [...group, stat];
        onChange(groups.map((g, i) => (i === idx ? next : g)));
    }, [groups, onChange]);

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                Основные характеристики
                <InfoTooltip text="Подсказка для игрока. Если основные характеристики нужно перечислить через 'и', это одна группа (например, у Монаха: ЛОВ и МУД). Если характеристик несколько на выбор и это 'или', то это две группы (например, у Воина: СИЛ или ЛОВ)." />
            </label>
            {groups.map((group, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                    {idx > 0 && (
                        <div className="flex items-center gap-2 text-[10px] text-pumpkin-muted/60 uppercase tracking-wide">
                            <span className="h-px flex-1 bg-pumpkin-border" />
                            или
                            <span className="h-px flex-1 bg-pumpkin-border" />
                        </div>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex flex-wrap gap-1">
                            {STAT_KEYS.map((stat) => {
                                const on = group.includes(stat);
                                return (
                                    <button
                                        key={stat}
                                        type="button"
                                        onClick={() => toggleStat(idx, stat)}
                                        className={`px-2 py-1 rounded text-xs border uppercase transition-colors ${
                                            on
                                                ? 'border-pumpkin-orange/40 bg-pumpkin-orange/10 text-pumpkin-orange'
                                                : 'border-pumpkin-border bg-pumpkin-bg text-pumpkin-muted hover:border-pumpkin-orange/20'
                                        }`}
                                    >
                                        {stat}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => removeGroup(idx)}
                            className="p-1 text-pumpkin-muted hover:text-red-400"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                    {group.length > 1 && (
                        <span className="text-[10px] text-pumpkin-muted/70 pl-0.5">
                            {group.map((s) => s.toUpperCase()).join(' и ')}
                        </span>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={addGroup}
                className="text-xs text-pumpkin-muted hover:text-pumpkin-text transition-colors self-start py-1"
            >
                + Добавить альтернативу
            </button>
        </div>
    );
}

// ── Tags editor (subclasses/subraces/races) ──────────────────────────────

function TagsEditor({ label, tags, onChange, hint }: {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    hint?: string;
}) {
    const [draft, setDraft] = useState('');

    const addTag = useCallback(() => {
        const trimmed = draft.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
        }
        setDraft('');
    }, [draft, tags, onChange]);

    const removeTag = useCallback((tag: string) => {
        onChange(tags.filter((t) => t !== tag));
    }, [tags, onChange]);

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-pumpkin-muted flex items-center gap-1">
                {label}
                {hint && <InfoTooltip text={hint} />}
            </label>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border border-pumpkin-border bg-pumpkin-bg text-pumpkin-text"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="text-pumpkin-muted hover:text-red-400"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <div className="flex gap-1">
                <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                        }
                    }}
                    placeholder="Добавить тег и нажать Enter"
                    className="flex-1 rounded-lg border border-pumpkin-border bg-pumpkin-bg px-3 py-2 text-sm text-pumpkin-text placeholder:text-pumpkin-muted/50 focus:outline-none focus:border-pumpkin-orange/50"
                />
                <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 rounded-lg border border-pumpkin-border text-pumpkin-muted hover:text-pumpkin-text text-sm transition-colors"
                >
                    +
                </button>
            </div>
        </div>
    );
}

// ── Leveled grants mini-editor ────────────────────────────────────────────

function LeveledGrantsEditor({ leveledGrants, entityPath, onChange }: {
    leveledGrants: LeveledGrants[];
    entityPath: string;
    onChange: (lg: LeveledGrants[]) => void;
}) {
    const handleAddLevel = useCallback(() => {
        const existing = new Set(leveledGrants.map((l) => l.level));
        let level = 1;
        while (existing.has(level)) level++;
        onChange([...leveledGrants, { level, grants: [] }].sort((a, b) => a.level - b.level));
    }, [leveledGrants, onChange]);

    const updateLevel = useCallback((level: number, grants: Grant[]) => {
        onChange(leveledGrants.map((l) => l.level === level ? { ...l, grants } : l));
    }, [leveledGrants, onChange]);

    const removeLevel = useCallback((level: number) => {
        onChange(leveledGrants.filter((l) => l.level !== level));
    }, [leveledGrants, onChange]);

    return (
        <div className="flex flex-col gap-3">
            {leveledGrants.map((lg) => (
                <div key={lg.level} className="rounded-lg border border-pumpkin-border bg-pumpkin-surface overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-pumpkin-border">
                        <span className="text-sm font-medium text-pumpkin-text">Уровень {lg.level}</span>
                        <button
                            onClick={() => removeLevel(lg.level)}
                            className="p-0.5 text-pumpkin-muted hover:text-red-400"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                    <div className="p-3">
                        <GrantList
                            grants={lg.grants}
                            entityPath={`${entityPath}@${lg.level}`}
                            onChange={(g) => updateLevel(lg.level, g)}
                            compact
                        />
                    </div>
                </div>
            ))}
            <button
                onClick={handleAddLevel}
                className="text-sm text-pumpkin-muted hover:text-pumpkin-text transition-colors self-start py-1"
            >
                + Добавить уровень
            </button>
        </div>
    );
}
