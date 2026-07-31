import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumbs from "@/shared/components/Breadcrumbs";

export const metadata: Metadata = {
    title: "Гайд по редактору датасетов LSS",
    description:
        "Что нужно знать, чтобы собрать хоумбрю-расу, черту или класс и не потерять эффекты на листе.",
    alternates: {
        canonical: "/lss/dataset-editor/guide/",
    },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            {children}
        </section>
    );
}

function Tip({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-pumpkin-orange/10 border border-pumpkin-orange/30 rounded-lg px-4 py-3 text-sm text-pumpkin-text leading-relaxed">
            {children}
        </div>
    );
}

function Danger({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-pumpkin-text leading-relaxed">
            {children}
        </div>
    );
}

export default function GuidePage() {
    return (
        <div className="max-w-3xl mx-auto px-6 py-24 flex flex-col gap-10">
            <div className="flex flex-col gap-3">
                <Breadcrumbs items={[
                    { label: "Главная", href: "/" },
                    { label: "LSS", href: "/lss" },
                    { label: "Редактор датасетов", href: "/lss/dataset-editor/" },
                    { label: "Гайд" },
                ]} />
                <div className="flex items-center gap-3">
                    <BookOpen size={24} className="text-pumpkin-orange" />
                    <h1 className="text-3xl font-bold tracking-tight">Гайд по редактору</h1>
                </div>
                <p className="text-pumpkin-muted text-base max-w-xl leading-relaxed">
                    Коротко о самом непонятном: как устроены гранты, куда пропадают эффекты
                    и почему класс нельзя механизировать целиком.
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {/* ── Словарь ──────────────────────────────────────────── */}

                <Section title="Что есть что">
                    <dl className="flex flex-col gap-4 text-pumpkin-muted leading-relaxed">
                        <div>
                            <dt className="text-pumpkin-text font-medium">Датасет</dt>
                            <dd>Контейнер, который объединяет расы, классы, черты и предыстории из одного источника — как книга правил. Именно датасет вы скачиваете JSON-файлом и подключаете в LSS.</dd>
                        </div>
                        <div>
                            <dt className="text-pumpkin-text font-medium">Сущность</dt>
                            <dd>Один экземпляр внутри датасета: конкретная раса («Двемер»), конкретная черта («Меткий стрелок»), конкретный класс. Сущность — это список грантов.</dd>
                        </div>
                        <div>
                            <dt className="text-pumpkin-text font-medium">Грант</dt>
                            <dd>Атомарный эффект: +2 к силе, владение мечами, счётчик ярости, описание способности. Каждый грант делает что-то одно. Добавляя грант, вы говорите «эта сущность даёт персонажу вот это».</dd>
                        </div>
                        <div>
                            <dt className="text-pumpkin-text font-medium">Канал</dt>
                            <dd>То, как грант попадает на лист. Каналов три: <strong className="text-pumpkin-text">текстовый</strong> (описания, языки, чувства), <strong className="text-pumpkin-text">числовой</strong> (бонусы к КД, атаке, спасброскам), <strong className="text-pumpkin-text">ресурсный</strong> (счётчики). Каждый тип гранта идёт строго по своему каналу.</dd>
                        </div>
                    </dl>
                </Section>

                {/* ── Один нюанс: skill-choice на предыстории ──────────── */}

                <Section title="Черты (feats) — прозрачный контейнер, с одним нюансом">
                    <div className="flex flex-col gap-3 text-pumpkin-muted leading-relaxed">
                        <p>
                            Черта (<code>feat</code>) прозрачна для всех каналов: числовые бонусы (<code>bonus</code>, <code>asi-*</code>), выборы навыков и экспертизы, галочки владения оружием, текст и счётчики — всё, что лежит внутри её собственных грантов, доезжает до листа персонажа так же, как если бы было выдано напрямую расой или классом. Не нужно бояться класть числа в черту.
                        </p>
                        <Tip>
                            Единственный нюанс — не про черты вообще, а конкретно про <strong className="text-pumpkin-text">выбор навыка на предыстории</strong>: если <code>skill-choice</code> висит прямо на предыстории (сам по себе или раскрытый из её черты), редактор персонажа сейчас не покажет игроку слот для этого выбора — только владения показываются (<code>skill-fixed</code>). Выбор навыка вешайте на расу, подрасу или класс.
                        </Tip>
                    </div>
                </Section>

                {/* ── Trait + params ───────────────────────────────────── */}

                <Section title="Описание способности и params не дружат">
                    <div className="flex flex-col gap-3 text-pumpkin-muted leading-relaxed">
                        <p>
                            У гранта типа <code>trait</code> есть поле <code>params</code> — числа, которые едут по числовому каналу (дистанция тёмного зрения, урон ауры), и поле <code>description</code> — текст, который едет по текстовому.
                        </p>
                        <p>
                            <strong className="text-pumpkin-text">Если у trait есть и params, и description — текстовый канал его отфильтрует.</strong> Описание на лист не попадёт.
                        </p>
                        <Danger>
                            Способность «Аура защиты: +2 к спасброскам» с описанием «Союзники в радиусе 10 футов получают бонус...» потеряет описание. Нужно разделить на два гранта: trait с params (числовой) и trait без params (текстовый).
                        </Danger>
                        <Tip>
                            Единственное исключение — чувства (<code>darkvision</code>, <code>blindsight</code>). У них params и описание живут вместе в особом блоке «Чувства» на листе. Редактор сам создаёт правильный trait через пресет «Чувство: тёмное зрение».
                        </Tip>
                    </div>
                </Section>

                {/* ── Ресурсы ──────────────────────────────────────────── */}

                <Section title="Счётчики (resource) и пара с описанием">
                    <div className="flex flex-col gap-3 text-pumpkin-muted leading-relaxed">
                        <p>
                            Грант <code>resource</code> создаёт счётчик использований. Он должен стоять рядом с описанием способности — иначе на листе счётчик повиснет в общей куче, оторванный от текста.
                        </p>
                        <p>
                            Связка работает через <code>id</code>: у trait и у resource один и тот же <code>id</code>, тогда лист ставит их рядом. Если описания нет (счётчик самодостаточен) — поставьте <code>pairId: null</code>, чтобы линт не ругался.
                        </p>
                        <Tip>
                            Когда добавляете ресурс через пикер «Добавить грант», редактор подхватывает id от единственной trait-способности сущности автоматически. Если способностей несколько — выберите нужную в форме.
                        </Tip>
                    </div>
                </Section>

                {/* ── Формулы ──────────────────────────────────────────── */}

                <Section title="Число или формула — что-то одно">
                    <div className="flex flex-col gap-3 text-pumpkin-muted leading-relaxed">
                        <p>
                            У многих грантов есть пары полей вроде <code>value / expr</code> или <code>max / maxExpr</code>. Это не два независимых поля — это выбор: или число, или формула.
                        </p>
                        <Danger>
                            <strong>Если заполнить оба — победит одно из них, второе молча проигнорируется.</strong> Например, у ресурса с <code>max: 3</code> и <code>maxExpr: &quot;2*[PROF]&quot;</code> сработает формула, а 3 потеряется.
                        </Danger>
                        <p>
                            Линт подсветит ошибку, если обнаружит оба значения. Используйте переключатель «Число / Формула» в форме — он сам очищает неиспользуемое поле.
                        </p>
                    </div>
                </Section>

                {/* ── Классы ───────────────────────────────────────────── */}

                <Section title="Класс — всегда частичная механизация">
                    <div className="flex flex-col gap-3 text-pumpkin-muted leading-relaxed">
                        <p>
                            Класс механизируется <strong className="text-pumpkin-text">частично</strong>, и это нормально. Кость хитов, спасброски, заклинания, счётчики способностей — да. Но кости урона атак, нечисловые правила («раз в ход», «если цель на 20 футов ниже») и таблицы типа «количество ячеек на уровне» уезжают прозой в описание trait.
                        </p>
                        <p>
                            Это не недоработка редактора, а сознательное ограничение формата LSS: автолист умеет собирать числа, но не умеет собирать правила. Текст, который нельзя выразить грантом, пишите в описании способности (trait с <code>description</code>) — игрок прочитает его в спойлере на листе.
                        </p>
                    </div>
                </Section>

                {/* ── Что дальше ────────────────────────────────────────── */}

                <Section title="Коротко: главные правила">
                    <ol className="list-decimal pl-6 flex flex-col gap-2 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
                        <li><strong className="text-pumpkin-text">Выбор навыка (skill-choice) на предыстории не показывает слот игроку.</strong> Вешайте выбор навыка на расу, подрасу или класс — остальные эффекты в черте (включая числовые) работают без ограничений.</li>
                        <li><strong className="text-pumpkin-text">trait с params + description = описание потеряется.</strong> Разделите на два trait: один с числами, другой с текстом.</li>
                        <li><strong className="text-pumpkin-text">value и expr (или max и maxExpr) — взаимоисключающие.</strong> Заполните что-то одно.</li>
                        <li><strong className="text-pumpkin-text">Ресурс должен знать, к какой способности он относится.</strong> Дайте ему тот же id, что у trait.</li>
                        <li><strong className="text-pumpkin-text">Класс не механизируется на 100% — и не должен.</strong> Правила, которые нельзя выразить числами, идут текстом в описании.</li>
                        <li><strong className="text-pumpkin-text">Данные хранятся в браузере.</strong> Регулярно выгружайте датасеты JSON-файлом — это единственная страховка от потери.</li>
                    </ol>
                </Section>

                <p className="text-pumpkin-muted text-sm leading-relaxed">
                    Остались вопросы? Загляните в исходный{" "}
                    <a href="https://storyview.ru/docs/plans/dataset-editor-guide" className="text-pumpkin-orange hover:underline">гайд для разработчиков от команды LSS</a>{" "}
                    — он подробнее, но на английском и местами технический.
                </p>
            </div>
        </div>
    );
}
