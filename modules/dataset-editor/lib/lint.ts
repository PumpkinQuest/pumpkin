import type { Grant, Dataset, DatasetClass, DatasetSubclass, DatasetRace, DatasetSubrace, DatasetBackground, DatasetFeat } from "./types";
import { isKnownBonusTarget, isLiveBonusTarget, SKILL_KEYS, STAT_KEYS, ARMOR_PROF_KEYS, WEAPON_PROF_KEYS } from "./registry/bonusTargets";
import { isKnownGrantType, isLiveGrantType } from "./registry/grantTypes";
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
    | 'duplicate-id'
    | 'dangling-ref'
    | 'non-slug-ref';

export type LintIssue = {
    severity: LintSeverity;
    rule: LintRule;
    path: string;
    message: string;
};

const SKILL_KEY_SET = new Set<string>(SKILL_KEYS);
const STAT_KEY_SET = new Set<string>(STAT_KEYS);
const PROF_KEY_SET = new Set<string>([...ARMOR_PROF_KEYS, ...WEAPON_PROF_KEYS]);
const STANDARD_CLASS_ID_SET = new Set<string>(STANDARD_CLASSES.map((c) => c.id));
const STANDARD_RACE_ID_SET = new Set<string>(STANDARD_RACES.map((r) => r.id));

// Expected shape of a cross-dataset-friendly id: lowercase slug of the
// English name (see dataset-editor-guide.md §5.7) — not a strict rule,
// just a hint for authors typing a custom classId/raceId by hand.
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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

    const addLeveled = (kind: string, list?: Array<{ id: string; leveledGrants?: Array<{ level: number; grants: Grant[] }> }>): void => {
        list?.forEach((e) => e.leveledGrants?.forEach((lg) => {
            out.push({ path: `${kind}/${e.id}@${lg.level}`, grants: lg.grants });
        }));
    };
    addLeveled('classes', dataset.classes);
    addLeveled('subclasses', dataset.subclasses);
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
        err('unknown-grant-type', `Unknown grant type "${type}" — this grant will never apply. Typo?`);
        return;
    }
    if (!isLiveGrantType(type)) {
        warn('dead-grant-type', `Grant type "${type}" is declared but not consumed — the grant will be silently ignored.`);
    }

    switch (grant.type) {
        case 'bonus': {
            if (!isKnownBonusTarget(grant.target)) {
                err('unknown-target', `Unknown target "${grant.target}" — the bonus will not apply. Typo?`);
            } else if (!isLiveBonusTarget(grant.target)) {
                warn('dead-target', `Target "${grant.target}" is declared but not read by the sheet — bonus ignored.`);
            }
            const hasValue = typeof grant.value === 'number';
            const hasExpr = typeof grant.expr === 'string' && grant.expr !== '';
            if (!hasValue && !hasExpr) err('bonus-value', 'Bonus has no value and no expr — always yields 0.');
            if (hasValue && hasExpr) err('bonus-value', 'Bonus has both value and expr — value wins, expr will not compute.');
            break;
        }
        case 'skill-fixed':
            grant.skills.forEach((s) => {
                if (!SKILL_KEY_SET.has(s)) err('unknown-skill', `Unknown skill "${s}" — proficiency will not set.`);
            });
            break;
        case 'skill-choice':
            if (grant.options !== 'any') {
                grant.options.forEach((s) => {
                    if (!SKILL_KEY_SET.has(s)) err('unknown-skill', `Unknown skill "${s}" in choice options.`);
                });
            }
            break;
        case 'saving-throw':
            grant.stats.forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Unknown ability score "${s}" — save proficiency not set.`);
            });
            break;
        case 'asi-fixed':
            Object.keys(grant.values).forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Unknown ability score "${s}" in asi-fixed.`);
            });
            break;
        case 'asi-flexible':
            grant.sets.forEach((set, i) => set.options?.forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Unknown ability score "${s}" in sets[${i}].options.`);
            }));
            break;
        case 'asi-pool':
            grant.options.forEach((s) => {
                if (!STAT_KEY_SET.has(s)) err('unknown-stat', `Unknown ability score "${s}" in asi-pool.options.`);
            });
            break;
        case 'armor-prof':
            grant.armors.forEach((k) => {
                if (!PROF_KEY_SET.has(k)) err('unknown-prof-key', `Unknown armor key "${k}".`);
            });
            break;
        case 'weapon-prof':
            grant.weapons.forEach((k) => {
                if (!PROF_KEY_SET.has(k)) err('unknown-prof-key', `Unknown weapon key "${k}".`);
            });
            break;
        default:
            break;
    }
}

// ── Cross-entity refs ──────────────────────────────────────────────────────

function lintRefs(dataset: Dataset, issues: LintIssue[]): void {
    const checkDuplicates = (kind: string, list?: Array<{ id: string }>): void => {
        const seen = new Set<string>();
        list?.forEach((e) => {
            if (seen.has(e.id)) {
                issues.push({
                    severity: 'error', rule: 'duplicate-id', path: `${kind}/${e.id}`,
                    message: `Duplicate id "${e.id}" — character choices resolve by id, last one wins.`,
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

    // Refs are checked against the dataset itself *and* the well-known SRD
    // class/race ids (STANDARD_CLASSES/STANDARD_RACES) — a subclass/subrace
    // can legitimately point at a base class/race that lives outside this
    // dataset, as long as it's one of those standard ids (see
    // dataset-editor-guide.md §5.7 and the picker's tooltip in EntityEditor).
    const classIds = new Set(dataset.classes?.map((c) => c.id) ?? []);
    dataset.subclasses?.forEach((s) => {
        if (classIds.has(s.classId) || STANDARD_CLASS_ID_SET.has(s.classId)) return;
        issues.push({
            severity: 'error', rule: 'dangling-ref', path: `subclasses/${s.id}`,
            message: `classId "${s.classId}" not found in dataset.classes and is not a standard SRD class — subclass will not appear.`,
        });
        if (s.classId && !SLUG_RE.test(s.classId)) {
            issues.push({
                severity: 'warning', rule: 'non-slug-ref', path: `subclasses/${s.id}`,
                message: `classId "${s.classId}" is not a lowercase-hyphen slug — it won't match another dataset's class or a standard SRD id even if the class is added later.`,
            });
        }
    });

    const raceIds = new Set(dataset.races?.map((r) => r.id) ?? []);
    dataset.subraces?.forEach((s) => {
        if (raceIds.has(s.raceId) || STANDARD_RACE_ID_SET.has(s.raceId)) return;
        issues.push({
            severity: 'error', rule: 'dangling-ref', path: `subraces/${s.id}`,
            message: `raceId "${s.raceId}" not found in dataset.races and is not a standard SRD race — subrace will not appear.`,
        });
        if (s.raceId && !SLUG_RE.test(s.raceId)) {
            issues.push({
                severity: 'warning', rule: 'non-slug-ref', path: `subraces/${s.id}`,
                message: `raceId "${s.raceId}" is not a lowercase-hyphen slug — it won't match another dataset's race or a standard SRD id even if the race is added later.`,
            });
        }
    });

    const featIds = new Set(dataset.feats?.map((f) => f.id) ?? []);
    for (const entity of entities(dataset)) {
        walkGrants(entity.grants, `${entity.path}/grants`, (grant, path) => {
            if (grant.type === 'feat' && grant.featId !== 'any' && !featIds.has(grant.featId)) {
                issues.push({
                    severity: 'error', rule: 'dangling-ref', path,
                    message: `featId "${grant.featId}" not found in dataset.feats — feat will not grant.`,
                });
            }
        });
    }
}

// ── Public API ─────────────────────────────────────────────────────────────

export function lintDataset(dataset: Dataset): LintIssue[] {
    const issues: LintIssue[] = [];
    for (const entity of entities(dataset)) {
        walkGrants(entity.grants, `${entity.path}/grants`, (grant, path) => {
            lintGrant(grant, path, issues);
        });
    }
    lintRefs(dataset, issues);
    return issues;
}

export function lintErrors(dataset: Dataset): LintIssue[] {
    return lintDataset(dataset).filter((i) => i.severity === 'error');
}

export function formatLintIssue(issue: LintIssue): string {
    return `[${issue.severity}] ${issue.rule} @ ${issue.path}: ${issue.message}`;
}
