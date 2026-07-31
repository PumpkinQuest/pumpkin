import type { Grant, Dataset, DatasetClass, DatasetSubclass, DatasetRace, DatasetSubrace, DatasetBackground, DatasetFeat } from "./types";
import { isKnownBonusTarget, isLiveBonusTarget, SKILL_KEYS, STAT_KEYS, ARMOR_PROF_KEYS, WEAPON_PROF_KEYS } from "./registry/bonusTargets";
import { isKnownGrantType, isLiveGrantType } from "./registry/grantTypes";
import { isSenseTraitId } from "./registry/senses";
import { STANDARD_CLASSES, STANDARD_RACES } from "./standardClasses";

// ---------------------------------------------------------------------------
// Dataset linter — validates a dataset against the format contract.
// Runs on import and on every edit; errors = reject, warnings = show to author.
// ---------------------------------------------------------------------------

export type LintSeverity = 'error' | 'warning';

export type LintRule =
    | 'unknown-grant-type'
    | 'dead-grant-type'
    | 'unknown-target'
    | 'dead-target'
    | 'bonus-value'
    | 'unknown-skill'
    | 'unknown-stat'
    | 'unknown-prof-key'
    | 'unknown-size-value'
    | 'duplicate-id'
    | 'dangling-ref'
    | 'non-slug-ref'
    | 'numeric-trait-prose'
    | 'resource-max'
    | 'resource-pair'
    | 'resource-no-slot';

export type LintIssue = {
    severity: LintSeverity;
    rule: LintRule;
    path: string;
    message: string;
};

const SKILL_KEY_SET = new Set<string>(SKILL_KEYS);
const STAT_KEY_SET = new Set<string>(STAT_KEYS);
const PROF_KEY_SET = new Set<string>([...ARMOR_PROF_KEYS, ...WEAPON_PROF_KEYS]);

// Expected shape of a cross-dataset-friendly id: lowercase slug of the
// English name (see dataset-editor-guide.md §5.7) — not a strict rule,
// just a hint for authors typing a custom classId/raceId by hand.
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * pumpkin ships no bundled SRD data, so there's nothing to pass as `ambient`
 * for the most common cross-book reference (a homebrew subclass pointing its
 * `classId` at a standard class it doesn't itself carry). This synthesizes a
 * minimal read-only "SRD" dataset from the well-known id lists so that case
 * resolves out of the box; real ambient datasets (the rest of the user's
 * local library) are merged in on top by the caller — see lintDataset below.
 */
const STANDARD_AMBIENT: Dataset = {
    id: '__standard__',
    name: 'Стандартные SRD id',
    system: 'dnd_5',
    edition: '',
    author: '',
    classes: STANDARD_CLASSES.map((c) => ({ id: c.id, label: c.label, grants: [], info: { primaryStats: [], complexity: 0 } })),
    races: STANDARD_RACES.map((r) => ({ id: r.id, label: r.label, size: 'medium', grants: [] })),
};

// ── Grant walker (recursive into pick-one) ─────────────────────────────────

function walkGrants(
    grants: Grant[] | undefined,
    path: string,
    visit: (grant: Grant, path: string) => void,
): void {
    grants?.forEach((grant, i) => {
        const at = `${path}[${i}]`;
        visit(grant, at);
        if (grant.type === 'pick-one') {
            grant.options.forEach((opt, j) => {
                walkGrants(opt.grants, `${at}/options[${j}]/grants`, visit);
            });
        }
    });
}

// ── Entity enumeration ─────────────────────────────────────────────────────

function entities(dataset: Dataset): Array<{ path: string; grants?: Grant[] }> {
    const out: Array<{ path: string; grants?: Grant[] }> = [];
    const add = (kind: string, list?: Array<{ id: string; grants?: Grant[] }>): void => {
        list?.forEach((e) => out.push({ path: `${kind}/${e.id}`, grants: e.grants }));
    };
    add('classes', dataset.classes);
    add('subclasses', dataset.subclasses);
    add('races', dataset.races);
    add('subraces', dataset.subraces);
    add('backgrounds', dataset.backgrounds);
    add('feats', dataset.feats);

    // Leveled grants hang off classes/subclasses AND races/subraces (2024
    // lineage spells at levels 3/5, Goliath Large Form at 5) — see
    // DatasetRace.leveledGrants in types.ts.
    const addLeveled = (kind: string, list?: Array<{ id: string; leveledGrants?: Array<{ level: number; grants: Grant[] }> }>): void => {
        list?.forEach((e) => e.leveledGrants?.forEach((lg) => {
            out.push({ path: `${kind}/${e.id}@${lg.level}`, grants: lg.grants });
        }));
    };
    addLeveled('classes', dataset.classes);
    addLeveled('subclasses', dataset.subclasses);
    addLeveled('races', dataset.races);
    addLeveled('subraces', dataset.subraces);
    return out;
}

// ── Per-grant rules ────────────────────────────────────────────────────────

function lintGrant(grant: Grant, path: string, issues: LintIssue[]): void {
    const err = (rule: LintRule, message: string): void => {
        issues.push({ severity: 'error', rule, path, message });
    };
    const warn = (rule: LintRule, message: string): void => {
        issues.push({ severity: 'warning', rule, path, message });
    };

    const type: string = grant.type;
    if (!isKnownGrantType(type)) {
        err('unknown-grant-type', `Неизвестный тип гранта «${type}» — он никогда не применится. Опечатка?`);
        return;
    }
    if (!isLiveGrantType(type)) {
        warn('dead-grant-type', `Тип гранта «${type}» описан в формате, но лист его не читает — грант будет молча проигнорирован.`);
    }

    switch (grant.type) {
        case 'bonus': {
            if (!isKnownBonusTarget(grant.target)) {
                err('unknown-target', `Неизвестная цель «${grant.target}» — бонус не применится. Опечатка?`);
            } else if (!isLiveBonusTarget(grant.target)) {
                warn('dead-target', `Цель «${grant.target}» описана в формате, но лист её не читает — бонус ни на что не повлияет.`);
            }
            const hasValue = typeof grant.value === 'number';
            const hasExpr = typeof grant.expr === 'string' && grant.expr !== '';
            if (!hasValue && !hasExpr) err('bonus-value', 'У бонуса нет ни значения, ни формулы — он всегда даст 0.');
            if (hasValue && hasExpr) err('bonus-value', 'У бонуса есть и значение, и формула — победит значение, формула не посчитается. Оставьте что-то одно.');
            break;
        }
        case 'skill-fixed':
            grant.skills.forEach((s) => {
                if (!SKILL_KEY_SET.has(s)) err('unknown-skill', `Неизвестный навык «${s}» — владение не проставится.`);
            });
            break;
        case 'skill-choice':
            if (grant.options !== 'any') {
                grant.options.forEach((s) => {
                    if (!SKILL_KEY_SET.has(s)) err('unknown-skill', `Неизвестный навык «${s}» среди вариантов выбора.`);
                });
            }
            break;
        case 'saving-throw':
            grant.stats.forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Неизвестная характеристика «${s}» — владение спасброском не проставится.`);
            });
            break;
        case 'asi-fixed':
            Object.keys(grant.values).forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Неизвестная характеристика «${s}» в фиксированном бонусе к характеристикам.`);
            });
            break;
        case 'asi-flexible':
            grant.sets.forEach((set, i) => set.options?.forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Неизвестная характеристика «${s}» в наборе №${i + 1}.`);
            }));
            break;
        case 'asi-pool':
            grant.options.forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Неизвестная характеристика «${s}» среди вариантов пула.`);
            });
            break;
        case 'armor-prof':
            grant.armors.forEach((k) => {
                if (!PROF_KEY_SET.has(k)) err('unknown-prof-key', `Неизвестный тип брони «${k}» — владение не проставится.`);
            });
            break;
        case 'weapon-prof':
            grant.weapons.forEach((k) => {
                if (!PROF_KEY_SET.has(k)) err('unknown-prof-key', `Неизвестная категория оружия «${k}» — владение не проставится.`);
            });
            break;
        case 'trait': {
            // The text channel filters out traits WITH params (their number
            // already rides the numeric channel) — except senses, which render
            // params AND description together in their own block. Any other
            // trait carrying both params and description silently loses the
            // description. See dataset-editor-guide.md §5.5.
            if (grant.params && grant.description && !isSenseTraitId(grant.id)) {
                warn('numeric-trait-prose',
                    `Черта «${grant.id}» несёт params и при этом имеет описание — `
                    + 'текстовый канал такие черты отфильтровывает, описание на лист не попадёт. '
                    + 'Разделите на два гранта: числовой (с params) и текстовый (без).');
            }
            break;
        }
        case 'size': {
            const value: string = grant.value;
            if (value !== 'small' && value !== 'medium' && value !== 'large') {
                err('unknown-size-value', `Неизвестный размер «${value}» — категория не проставится.`);
            }
            break;
        }
        case 'resource': {
            const hasMax = typeof grant.max === 'number';
            const maxExpr = typeof grant.maxExpr === 'string' && grant.maxExpr !== '' ? grant.maxExpr : null;
            if (!hasMax && !maxExpr) {
                err('resource-max', 'Ресурс без max и maxExpr — счётчик будет без максимума: отдых не восстановит его, «+» не остановится.');
            }
            if (hasMax && maxExpr) {
                err('resource-max', 'У ресурса и max, и maxExpr — победит maxExpr, число не применится.');
            }
            if (grant.shortRestRegain && !grant.isShortRest) {
                warn('resource-max', 'shortRestRegain без isShortRest — короткий отдых этот ресурс не восстанавливает, поле не сработает.');
            }
            // Only five slots read resources: class, subclass, race, subrace,
            // feat. Anywhere else the grant parses and does nothing at all.
            if (path.startsWith('backgrounds/')) {
                warn('resource-no-slot',
                    'Ресурс у предыстории никто не читает — счётчик не появится. '
                    + 'Ресурсы собираются с класса, подкласса, вида, линейки и черт: '
                    + 'перенесите его в черту происхождения (грант feat).');
            }
            if (path.includes('/options[')) {
                warn('resource-no-slot',
                    'Ресурс внутрь pick-one не заглядывают — счётчик не появится, какой бы вариант игрок ни выбрал. '
                    + 'Выдайте его сущностью напрямую.');
            }
            break;
        }
        default:
            break;
    }
}

/**
 * A counter is placed next to the Spoiler describing the same feature, matched
 * by `pairId` (default: the resource's own id) against the `trait` ids of the
 * SAME entity (grants + leveledGrants). No match isn't broken, just lonely —
 * the counter lands with the source's other counters instead of under its
 * description. See dataset-editor-guide.md §5.8 point 4.
 *
 * Feats are exempt: their paired trait id is stamped by the runtime gatherer,
 * not authored — mirrors datasetLint.ts's scope (classes/subclasses/races/subraces only).
 */
function lintResourcePairs(dataset: Dataset, issues: LintIssue[]): void {
    type PairEntity = {
        id: string;
        grants?: Grant[];
        leveledGrants?: Array<{ level: number; grants: Grant[] }>;
    };
    const check = (kind: string, list?: PairEntity[]): void => {
        list?.forEach((entity) => {
            const all = [
                ...(entity.grants ?? []),
                ...(entity.leveledGrants ?? []).flatMap((lg) => lg.grants),
            ];
            const traitIds = new Set(
                all.filter((g): g is Extract<Grant, { type: 'trait' }> => g.type === 'trait').map((g) => g.id),
            );
            for (const grant of all) {
                if (grant.type !== 'resource' || grant.pairId === null) continue;
                const pairId = grant.pairId ?? grant.id;
                if (traitIds.has(pairId)) continue;
                issues.push({
                    severity: 'warning',
                    rule: 'resource-pair',
                    path: `${kind}/${entity.id}`,
                    message: `Счётчику «${grant.name}» не с чем встать рядом: черты с id «${pairId}» у сущности нет. `
                        + 'На листе он окажется в общей группе счётчиков, а не под своим описанием. '
                        + 'Дайте ресурсу id той черты, которая его выдаёт, или укажите pairId — '
                        + 'а если описания и правда нет, поставьте pairId: null.',
                });
            }
        });
    };
    check('classes', dataset.classes as PairEntity[] | undefined);
    check('subclasses', dataset.subclasses as PairEntity[] | undefined);
    check('races', dataset.races as PairEntity[] | undefined);
    check('subraces', dataset.subraces as PairEntity[] | undefined);
}

// ── Cross-entity refs ──────────────────────────────────────────────────────

/** Ids of a kind across the dataset itself plus its ambient datasets. */
function ambientIds(
    dataset: Dataset,
    ambient: Dataset[],
    pick: (ds: Dataset) => Array<{ id: string }> | undefined,
): Set<string> {
    const set = new Set<string>();
    for (const ds of [dataset, ...ambient]) pick(ds)?.forEach((e) => set.add(e.id));
    return set;
}

function lintRefs(dataset: Dataset, ambient: Dataset[], issues: LintIssue[]): void {
    const checkDuplicates = (kind: string, list?: Array<{ id: string }>): void => {
        const seen = new Set<string>();
        list?.forEach((e) => {
            if (seen.has(e.id)) {
                issues.push({
                    severity: 'error', rule: 'duplicate-id', path: `${kind}/${e.id}`,
                    message: `Дубль id «${e.id}» — выборы персонажа резолвятся по id, победит последняя сущность с этим id.`,
                });
            }
            seen.add(e.id);
        });
    };
    checkDuplicates('classes', dataset.classes);
    checkDuplicates('subclasses', dataset.subclasses);
    checkDuplicates('races', dataset.races);
    checkDuplicates('subraces', dataset.subraces);
    checkDuplicates('backgrounds', dataset.backgrounds);
    checkDuplicates('feats', dataset.feats);

    // Refs resolve against the dataset itself AND its ambient datasets (other
    // datasets in the user's library, plus the synthetic standard-SRD-id list
    // merged in by lintDataset) — a subclass/subrace can legitimately point at
    // a base class/race that lives in a different connected book.
    const classIds = ambientIds(dataset, ambient, (ds) => ds.classes);
    dataset.subclasses?.forEach((s) => {
        if (classIds.has(s.classId)) return;
        issues.push({
            severity: 'error', rule: 'dangling-ref', path: `subclasses/${s.id}`,
            message: `Класс «${s.classId}» не найден ни в этом датасете, ни в подключённых — подкласс не появится в билдере.`,
        });
        if (s.classId && !SLUG_RE.test(s.classId)) {
            issues.push({
                severity: 'warning', rule: 'non-slug-ref', path: `subclasses/${s.id}`,
                message: `Идентификатор класса «${s.classId}» не похож на слаг (строчные буквы через дефис) — он не совпадёт с классом из другого датасета, даже если тот появится позже.`,
            });
        }
    });

    const raceIds = ambientIds(dataset, ambient, (ds) => ds.races);
    dataset.subraces?.forEach((s) => {
        if (raceIds.has(s.raceId)) return;
        issues.push({
            severity: 'error', rule: 'dangling-ref', path: `subraces/${s.id}`,
            message: `Раса «${s.raceId}» не найдена ни в этом датасете, ни в подключённых — подраса не появится в билдере.`,
        });
        if (s.raceId && !SLUG_RE.test(s.raceId)) {
            issues.push({
                severity: 'warning', rule: 'non-slug-ref', path: `subraces/${s.id}`,
                message: `Идентификатор расы «${s.raceId}» не похож на слаг (строчные буквы через дефис) — он не совпадёт с расой из другого датасета, даже если та появится позже.`,
            });
        }
    });

    // `featId: 'any'` is an open slot the player fills by hand — not a dangling ref.
    const featIds = ambientIds(dataset, ambient, (ds) => ds.feats);
    for (const entity of entities(dataset)) {
        walkGrants(entity.grants, `${entity.path}/grants`, (grant, path) => {
            if (grant.type === 'feat' && grant.featId !== 'any' && !featIds.has(grant.featId)) {
                issues.push({
                    severity: 'error', rule: 'dangling-ref', path,
                    message: `Черта «${grant.featId}» не найдена ни в этом датасете, ни в подключённых — она не выдастся персонажу.`,
                });
            }
        });
    }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * `ambient` are other datasets present alongside this one (the rest of the
 * user's local library) whose entity ids count as resolvable for cross-entity
 * refs but are NOT themselves linted. A homebrew "book" of subclasses passes
 * the class-carrying dataset it targets so its `classId` refs resolve — see
 * dataset-editor-guide.md §4.2. The synthetic standard-SRD-id list is always
 * merged in underneath, since pumpkin ships no bundled SRD data of its own.
 */
export function lintDataset(dataset: Dataset, ambient: Dataset[] = []): LintIssue[] {
    const issues: LintIssue[] = [];
    const allAmbient = [STANDARD_AMBIENT, ...ambient];
    for (const entity of entities(dataset)) {
        walkGrants(entity.grants, `${entity.path}/grants`, (grant, path) => {
            lintGrant(grant, path, issues);
        });
    }
    lintResourcePairs(dataset, issues);
    lintRefs(dataset, allAmbient, issues);
    return issues;
}

export function lintErrors(dataset: Dataset, ambient: Dataset[] = []): LintIssue[] {
    return lintDataset(dataset, ambient).filter((i) => i.severity === 'error');
}

export function formatLintIssue(issue: LintIssue): string {
    return `[${issue.severity}] ${issue.rule} @ ${issue.path}: ${issue.message}`;
}
