# Редактор датасетов — синхронизация с LSS: выборы игрока

Создан: 2026-09-28
Модуль: [`modules/dataset-editor/`](../../modules/dataset-editor/)
Контракт: публичная документация LSS —
[«Датасеты»](https://longstoryshort.app/doc/developers/datasets/) (разделы «Выборы игрока: что
можно собрать», «Развилка `pick-one`», «Черты на выбор: `feat` и `feat-choice`», таблица
проверок) и [Changelog](https://longstoryshort.app/doc/developers/changelog/), запись «выборы
игрока: развилки внутри черт и выбор нескольких черт». Схемы — `https://longstoryshort.app/schema/v1/`.

**Легенда статусов:** ✅ сделано · 🟡 сделано частично · ⛔ решено не делать ·
❓ требует решения перед выполнением · без метки — в бэклоге.

---

## 0. Зачем

LSS расширил контракт датасета. У нас лежат ручные копии типов, линта и реестров, и они
разошлись с ним. Последствия без правок:

- **импорт отклонит набор с `feat-choice`**: `lintGrant` не знает типа и ставит
  `unknown-grant-type` — это `error`, `importDataset` такой набор не пускает;
- автор не сможет завести слот воззваний, свою категорию черт (метамагия, приёмы) и поля
  `minLevel` / `repeatable`;
- линт даст ложное предупреждение на счётчик внутри именованной развилки, который LSS теперь
  читает;
- экспорт пропустит дубли `id` развилок и слотов — LSS такой набор отклонит.

## 1. Что поменялось в контракте

| Что | Было | Стало |
|---|---|---|
| Именованный `pick-one` (`id` + `options[].id`) | работал у сущности; внутри черты игрок его не видел, ветка доезжала только до чисел | работает где угодно: у сущности, в уровневой строке, **внутри черты**, в ветке другой развилки. Выбранная ветка доезжает во все каналы |
| `feat` с `featId: "any"` у класса и подкласса | выбор игрока не применялся | применяется |
| Новый грант `feat-choice` | — | слот на `count` черт категории: `{ type, id, count, category?, label?, classFeature? }` |
| `DatasetFeat.minLevel`, `DatasetFeat.repeatable` | — | новые необязательные поля |
| `FeatCategory` | enum из пяти значений | **произвольная строка** |
| `id` развилки | уникален на датасет (у нас не проверялось) | уникален на датасет **в одном пространстве с `id` слотов `feat-choice`** |

Словарь грантов: 29 типов.

## 2. Типы — `lib/types.ts`

```ts
/** Произвольная строка. Встроенные: origin, general, fighting-style, epic-boon;
 *  для воззваний принято invocation. Своя механика — своя категория. */
export type FeatCategory = string;

export type FeatChoiceGrant = {
    type: 'feat-choice';
    /** Ключ, по которому хранится выбор игрока. Уникален на весь датасет,
     *  общий namespace с pick-one.id. */
    id: string;
    label?: Label;
    count: number;
    category?: FeatCategory;
    /** Выбранное — способности класса: текст в «Умения и способности».
     *  Работает только у класса и подкласса. */
    classFeature?: boolean;
};

export type DatasetFeat = {
    id: string;
    label: Label;
    category?: FeatCategory;
    prerequisite?: string;
    /** Можно взять больше одного раза (в разных слотах feat-choice). */
    repeatable?: boolean;
    /** Уровень персонажа, с которого черту можно выбрать в слоте. 1–20. */
    minLevel?: number;
    grants: Grant[];
};
```

И `| FeatChoiceGrant` в union `Grant`.

## 3. Реестры

- **`registry/grantTypes.ts`** — `'feat-choice': { channel: 'choice', live: true, note: 'Several feats of a category; picks project like feat.' }`.
  Без этого импорт отклоняет наборы с новым грантом.
- **`registry/grantLabels.ts`** — `'feat-choice': 'Выбор нескольких черт'`.
- **`registry/grantCatalog.ts`**:
  - дефолт: `case 'feat-choice': return { type: 'feat-choice', id: '', count: 1 };` — `id`
    заполняет форма (§5.1);
  - пункт пикера, группа `'fork'` рядом с `pick-one`:
    `plain('feat-choice', 'fork', 'Выбор нескольких черт', 'Игрок выберет несколько черт из списка — воззвания, метамагию, приёмы, боевые стили.', ['воззвания', 'инвокации', 'метамагия', 'приёмы', 'манёвры', 'стиль', 'несколько', 'список', 'feat choice'])`.
    Проверка `_everyGrantTypeIsInTheCatalog` покраснеет, пока пункта нет, — это нормально.
- **`registry/labels.ts`** — категории перестают быть закрытым списком:
  - `FEAT_CATEGORY_LABELS: Record<string, string>` — подписи известных категорий
    (плюс `invocation` → «Воззвание» вместо «Инвокация» — так называет их LSS);
  - `FEAT_CATEGORIES` становится списком **подсказок**, а не допустимых значений;
  - хелпер `featCategoryLabel(c)` — подпись или сама строка.

## 4. Линт — `lib/lint.ts`

### 4.1. Убрать

- `resource-no-slot` для `path.includes('/options[')` (`lint.ts:248`). Счётчик в ветке
  **именованной** развилки теперь читается. Вместо этого — §4.2.

### 4.2. Добавить

**Счётчик в безымянной развилке** (развилку «снаряжение или золото» читает только канал
снаряжения — счётчик внутри неё мёртв). Путь не отличает именованную развилку от
безымянной, поэтому отдельный проход:

```ts
function lintDeadForkResources(dataset: Dataset, issues: LintIssue[]): void {
    const flagged = new Set<string>();
    for (const entity of entities(dataset)) {
        walkGrants(entity.grants, `${entity.path}/grants`, (grant, path) => {
            if (grant.type !== 'pick-one' || grant.id) return;
            grant.options.forEach((opt, j) => {
                walkGrants(opt.grants, `${path}/options[${j}]/grants`, (inner, at) => {
                    if (inner.type !== 'resource' || flagged.has(at)) return;
                    flagged.add(at);
                    issues.push({ severity: 'warning', rule: 'resource-no-slot', path: at,
                        message: 'Ресурс внутри безымянной развилки (снаряжение или золото) никто не читает — '
                            + 'счётчик не появится. Дайте развилке id и options[].id или выдайте ресурс напрямую.' });
                });
            });
        });
    }
}
```

**Уникальность `id` развилок и слотов** — `error`, одно пространство на весь датасет;
`options[].id` уникальны внутри своей развилки. Наш `walkGrants` в черты по ссылке `feat`
не спускается — так и надо: каждая черта уже обходится как своя сущность в `entities()`, и
развилка черты посчитается один раз. Если когда-нибудь спуск по ссылкам появится, в этой
проверке его делать нельзя: черта, которую выдают две предыстории, покажется дублем.

```ts
const choiceIds = new Set<string>();
for (const entity of entities(dataset)) {
    walkGrants(entity.grants, `${entity.path}/grants`, (grant, path) => {
        const id = (grant.type === 'pick-one' || grant.type === 'feat-choice') ? grant.id : undefined;
        if (id) {
            if (choiceIds.has(id)) issues.push({ severity: 'error', rule: 'duplicate-id', path,
                message: `Дублирующийся id «${id}» — по нему хранится выбор игрока, два выбора с одним id делят ответ.` });
            choiceIds.add(id);
        }
        if (grant.type !== 'pick-one') return;
        const seen = new Set<string>();
        for (const opt of grant.options) {
            if (!opt.id) continue;
            if (seen.has(opt.id)) issues.push({ severity: 'error', rule: 'duplicate-id', path,
                message: `Дублирующийся id варианта «${opt.id}» — резолвится только первый.` });
            seen.add(opt.id);
        }
    });
}
```

**`feat-choice`** — в `lintGrant`, новое правило `'feat-choice'`:

| Условие | Severity |
|---|---|
| `count` не больше нуля | error |
| пустой `id` | error |
| `classFeature: true` и путь начинается с `races/`, `subraces/`, `backgrounds/` — флаг ничего не сделает | warning |

**Слот без кандидатов** (`feat-slot-empty`, warning). Проверять слот `feat` с
`featId: "any"` и `feat-choice` по чертам текущего датасета, подключённой библиотеки и
стандартного SRD **той же редакции**. Для 2024 SRD 5.2 содержит реальные черты всех четырёх
стандартных категорий: `origin`, `general`, `fighting-style`, `epic-boon`. Их данные лежат в
`server-data/datasets/2024/srd-2024.json`; не заменять их исключениями или чертами-заглушками.
Для 2014 SRD 5.1 содержит только `grappler` без категории: он подходит слоту без фильтра,
но не подтверждает наличие черт `fighting-style` или `epic-boon`.

Линт остаётся чистой функцией: вызывающий код передаёт ему настоящий SRD-набор нужной редакции
в `ambient`. Если SRD ещё не загружен, отсутствие локальных кандидатов не доказывает пустой
список — правило `feat-slot-empty` в этом случае не срабатывает. Когда SRD загружен, предупреждать
только если кандидатов нет и в нём, и в текущем датасете, и в подключённой библиотеке.

**Поля черты** — новое правило `'feat-fields'`:

| Условие | Severity |
|---|---|
| `minLevel` не целое от 1 до 20 | error |
| `repeatable: true` и внутри черты именованный `pick-one` — у всех копий один ответ | warning |

### 4.3. Оставить

- `equipment-fork-named` — по-прежнему верно: снаряжение и золото из именованной развилки не
  доезжают до листа.

## 5. Интерфейс

### 5.1. Форма `feat-choice` (новая, `GrantEditor.tsx`)

| Поле | Контрол | Заметки |
|---|---|---|
| Заголовок | текст | «Таинственные воззвания» — видит игрок над слотом |
| Сколько выбрать | число ≥ 1 | |
| Категория | поле с подсказками (`<input list>` / combobox) | подсказки — категории черт в этом датасете и в библиотеке + известные. **Не `<select>`**: иначе своя механика невозможна |
| Идентификатор | текст, заполняется сам | по умолчанию слаг заголовка + уровень строки: `warlock-invocations-5`. Уникальность — среди всех развилок и слотов датасета; при коллизии суффикс `-2` |
| Способности класса | чекбокс «Это способности класса, а не черты» | **только** когда грант лежит у класса или подкласса. `GrantEditor` уже получает `entityPath` (сейчас не используется): `classes/…` или `subclasses/…` — показываем |

Строка в `GrantList.grantSummary`: `выбрать 2: invocation — Таинственные воззвания`
(с подписью категории, если она известна).

### 5.2. Категория везде — поле с подсказками

- `FeatGrantForm` (`GrantEditor.tsx:315`) — `<select>` из `FEAT_CATEGORIES` → поле с
  подсказками.
- Категория черты в `EntityEditor.tsx:214` и пикер категорий (`EntityEditor.tsx:489`) — то же.

### 5.3. Форма черты — два новых поля

- «Можно взять несколько раз» — чекбокс → `repeatable`;
- «Доступна с уровня» — число 1–20, пусто → `minLevel` не пишем.

Подсказка у полей: визард LSS блокирует такую черту в слоте с подписью «с N уровня» /
«уже выбрано».

### 5.4. Развилка

- `PickOneForm`: если `id` задан, подсветить коллизию с другими развилками и слотами (та же
  проверка, что в линте, прямо в форме).
- Развилка и слот внутри черты — законны. Формы грантов черты уже умеют любые гранты;
  проверить, что пикер предлагает `pick-one` и `feat-choice` и у черты.

### 5.5. Гайд (`guide/GuidePage.tsx`)

Добавить короткий раздел «Выборы игрока» — что теперь можно собрать:

- «Одно из нескольких» — развилка с идентификатором, в том числе внутри черты («владение ИЛИ
  экспертиза» у Наблюдателя);
- «Несколько из списка» — `feat-choice`: воззвания, метамагия, приёмы Мастера боя, боевые
  стили, инфузии, эпические дары;
- черта — любой пакет, выбираемый из списка; категория — любое слово;
- «ещё одно воззвание на 5 уровне» — ещё один слот в строке 5 уровня, а не таблица;
- чего пока нельзя: «повышение характеристик ИЛИ черта», требования кроме уровня (текстом в
  «Требовании»).

Формулировки и рецепты — в публичном разделе «Датасеты» (ссылка в шапке).

## 6. Проверка

Минимальный набор для ручной проверки — импорт в редактор, правка, экспорт, импорт в LSS:

```json
{
  "id": "choices-smoke", "name": "Проверка выборов", "system": "dnd_5", "edition": "2014",
  "author": "pumpkin", "license": "CC-BY-4.0",
  "feats": [
    { "id": "smoke-text", "label": "Текст", "category": "invocation",
      "grants": [{ "type": "trait", "id": "smoke-text", "name": "Текст", "description": "Только текст." }] },
    { "id": "smoke-lvl5", "label": "С 5 уровня", "category": "invocation", "minLevel": 5,
      "prerequisite": "Колдун 5 уровня", "grants": [] },
    { "id": "smoke-rep", "label": "Повторяемое", "category": "invocation", "repeatable": true,
      "grants": [{ "type": "bonus", "target": "save.wis", "value": 1, "label": "Повторяемое" }] },
    { "id": "smoke-meta", "label": "Своя категория", "category": "metamagic", "grants": [] },
    { "id": "smoke-fork", "label": "С развилкой", "category": "invocation",
      "grants": [{ "type": "pick-one", "id": "smoke-fork-branch", "label": "Ветка",
        "options": [
          { "id": "a", "label": "А", "grants": [{ "type": "resource", "id": "smoke-a", "name": "А", "maxExpr": "1", "isLongRest": true }] },
          { "id": "b", "label": "Б", "grants": [] }
        ] }] }
  ],
  "classes": [
    { "id": "smoke-warlock", "label": "Колдун (проверка)", "info": { "primaryStats": [["cha"]], "complexity": 1 },
      "grants": [
        { "type": "hp-die", "die": 8 },
        { "type": "feat-choice", "id": "smoke-inv-1", "label": "Воззвания", "count": 2, "category": "invocation", "classFeature": true },
        { "type": "feat-choice", "id": "smoke-meta-1", "label": "Метамагия", "count": 1, "category": "metamagic" }
      ],
      "leveledGrants": [
        { "level": 5, "grants": [{ "type": "feat-choice", "id": "smoke-inv-5", "label": "Воззвания", "count": 1, "category": "invocation", "classFeature": true }] }
      ] }
  ]
}
```

Ожидания:

1. Импорт проходит без ошибок и без предупреждений (счётчик `smoke-a` в именованной
   развилке — не предупреждение).
2. Слот `feat-choice` открывается в форме §5.1; своя категория `metamagic` вводится и
   подсказывается.
3. Поменять `id` слота `smoke-inv-5` на `smoke-inv-1` → `duplicate-id`, `error`. Поменять
   на `smoke-fork-branch` → тоже.
4. Поставить `classFeature: true` у слота на расе → предупреждение.
5. `minLevel: 0` у черты → ошибка.
6. Экспорт → импорт в библиотеку наборов LSS — без ошибок.

## 7. Порядок

1. Типы + `grantTypes` (§2, §3) — снимает отклонение импорта; можно выкатить отдельно.
2. Линт (§4).
3. Формы (§5.1–5.4).
4. Гайд (§5.5).
