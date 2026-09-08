import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import AccordionItem from "@/shared/components/AccordionItem";

export const metadata: Metadata = {
    title: "Гайд по редактору датасетов LSS",
    description:
        "Как собрать свой хоумбрю-контент в редакторе датасетов LSS: с чего начать и как устроен процесс.",
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
                    Как устроен редактор датасетов и как собрать в нём свой хоумбрю-контент —
                    от одной черты до целой книги правил.
                </p>
            </div>

            <div className="flex flex-col gap-8">
                {/* ── Что такое датасет ──────────────────────────────────── */}

                <Section title="Что такое датасет">
                    <div className="flex flex-col gap-3 text-pumpkin-muted leading-relaxed">
                        <p>
                            Датасет — это ваш собственный кусочек правил для LSS: расы, классы, черты
                            и предыстории, которые вы придумали сами и хотите использовать на листе
                            персонажа. Всё это собирается в один файл, который потом подключается в LSS —
                            и эффекты автоматически появляются на листе, без ручного подсчёта бонусов.
                        </p>
                        <p>
                            Не обязательно делать что-то масштабное. Датасет с одной-единственной
                            хоумбрю-чертой — такой же полноценный результат, как и датасет с целой
                            авторской книгой рас и классов. Начните с малого: добавьте то, что нужно
                            прямо сейчас, а остальное можно дособрать позже или не делать вовсе.
                        </p>
                    </div>
                </Section>

                {/* ── Из чего состоит датасет ────────────────────────────── */}

                <Section title="Из чего он состоит">
                    <dl className="flex flex-col gap-4 text-pumpkin-muted leading-relaxed">
                        <div>
                            <dt className="text-pumpkin-text font-medium">Датасет</dt>
                            <dd>Файл, который объединяет всё, что вы создали — как книга правил. Именно его вы скачиваете и подключаете в LSS.</dd>
                        </div>
                        <div>
                            <dt className="text-pumpkin-text font-medium">Сущность</dt>
                            <dd>Одна конкретная штука внутри датасета: раса («Двемер»), черта («Меткий стрелок»), класс, предыстория. У каждой сущности есть имя, описание и набор эффектов.</dd>
                        </div>
                        <div>
                            <dt className="text-pumpkin-text font-medium">Грант</dt>
                            <dd>Один эффект, который даёт сущность: +2 к силе, владение мечами, счётчик ярости, текст способности. Один грант — одно действие. Чтобы собрать сущность, вы просто добавляете ей нужные гранты один за другим.</dd>
                        </div>
                    </dl>
                </Section>

                {/* ── Как действовать ─────────────────────────────────────── */}

                <Section title="Как создать датасет — шаг за шагом">
                    <ol className="list-decimal pl-6 flex flex-col gap-3 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
                        <li>
                            <strong className="text-pumpkin-text">Создайте датасет</strong> и дайте
                            ему название — это просто новый пустой файл, в который вы будете
                            добавлять контент.
                        </li>
                        <li>
                            <strong className="text-pumpkin-text">Добавьте сущности</strong>, которые
                            вам нужны: расу, класс, черту или предысторию. Можно добавить одну —
                            если вам нужна только одна черта для одного персонажа, этого достаточно.
                        </li>
                        <li>
                            <strong className="text-pumpkin-text">Откройте сущность и наполните её грантами</strong>{" "}
                            через кнопку «Добавить грант»: бонус к характеристике, владение,
                            счётчик использований, текст способности — по одному эффекту за раз. Если грант
                            нужно выдать на определённом уровне, нажмите «Добавить уровень» и добавляйте гранты
                            внутри этого уровня.
                        </li>
                        <li>
                            <strong className="text-pumpkin-text">Следите за подсказками редактора.</strong>{" "}
                            Если что-то настроено так, что не попадёт на лист, редактор подсветит
                            это красным или жёлтым прямо рядом с полем.
                        </li>
                        <li>
                            <strong className="text-pumpkin-text">Экспортируйте датасет JSON-файлом</strong>{" "}
                            и подключите его в LSS на странице персонажа — эффекты появятся на
                            листе автоматически.
                        </li>
                    </ol>
                    <Tip>
                        Данные редактора датасетов хранятся у вас в браузере, а не на сервере. Пока вы не выгрузили
                        файл, всё живёт только на вашем компьютере — сохраняйте JSON почаще, это
                        единственная страховка от потери при случайной очистке кэша.
                    </Tip>
                </Section>

                {/* ── Нюансы (аккордеон) ──────────────────────────────────── */}

                <Section title="Нюансы и особые случаи">
                    <p className="text-pumpkin-muted leading-relaxed">
                        Это не обязательно к прочтению заранее — загляните сюда, если что-то на
                        листе персонажа выглядит не так, как вы ожидали.
                    </p>
                    <div className="flex flex-col gap-3">
                        <AccordionItem title="Описание способности и числа в одном trait не дружат" groupName="guide-gotchas">
                            <p>
                                У гранта типа <code>trait</code> есть поле <code>params</code> — числа,
                                которые едут по числовому каналу (дистанция тёмного зрения, урон ауры),
                                и поле <code>description</code> — текст, который едет по текстовому.
                            </p>
                            <p>
                                <strong className="text-pumpkin-text">Если у trait есть и params, и description — текстовый канал его отфильтрует.</strong>{" "}
                                Описание на лист не попадёт.
                            </p>
                            <Danger>
                                Способность «Аура защиты: +2 к спасброскам» с описанием «Союзники в
                                радиусе 10 футов получают бонус...» потеряет описание. Нужно разделить
                                на два гранта: trait с params (числовой) и trait без params (текстовый).
                            </Danger>
                            <Tip>
                                Единственное исключение — чувства: <code>darkvision</code>,{" "}
                                <code>blindsight</code>, <code>tremorsense</code>,{" "}
                                <code>truesight</code>. У них params и описание живут вместе в особом
                                блоке «Чувства» на листе. У каждого свой пресет в «Добавить грант» —
                                «Чувство: слепое зрение» и так далее; у уже добавленной черты вид
                                чувства меняется полем «Тип черты». Дистанция обязательна: у всех,
                                кроме тёмного зрения, она пустая (0) — впишите её, иначе линт
                                пометит грант ошибкой.
                            </Tip>
                        </AccordionItem>

                        <AccordionItem title="Число или формула — это одно и то же поле" groupName="guide-gotchas">
                            <p>
                                У бонусов и счётчиков есть поле-формула (<code>expr</code> у гранта{" "}
                                <code>bonus</code>, <code>maxExpr</code> у <code>resource</code>).
                                Отдельного поля для «просто числа» нет — если нужен фиксированный
                                бонус +2 или потолок счётчика 3, впишите туда просто{" "}
                                <code>2</code> или <code>3</code>: число — это тоже валидная формула.
                            </p>
                            <p>
                                Настоящая формула нужна только когда значение зависит от уровня или
                                характеристики, например <code>[PROF]</code> или{" "}
                                <code>2*[PROF]</code>.
                            </p>
                        </AccordionItem>

                        <AccordionItem title="Счётчик способности нужно привязать к ней" groupName="guide-gotchas">
                            <p>
                                Грант <code>resource</code> создаёт счётчик использований. Он должен
                                стоять рядом с описанием способности — иначе на листе счётчик
                                повиснет в общей куче, оторванный от текста.
                            </p>
                            <p>
                                Связка работает через <code>id</code>: у trait и у resource один и
                                тот же <code>id</code>, тогда лист ставит их рядом. Если описания нет
                                (счётчик самодостаточен) — поставьте <code>pairId: null</code>, чтобы
                                линт не ругался.
                            </p>
                            <Tip>
                                Когда добавляете ресурс через пикер «Добавить грант», редактор
                                подхватывает id от единственной trait-способности сущности
                                автоматически. Если способностей несколько — выберите нужную в форме.
                            </Tip>
                        </AccordionItem>

                        <AccordionItem title="Класс не механизируется на 100% — и это нормально" groupName="guide-gotchas">
                            <p>
                                Класс механизируется <strong className="text-pumpkin-text">частично</strong>.
                                Кость хитов, спасброски, заклинания, счётчики способностей — да. Но
                                кости урона атак, нечисловые правила («раз в ход», «если цель на 20
                                футов ниже») и таблицы типа «количество ячеек на уровне» уезжают
                                прозой в описание trait.
                            </p>
                            <p>
                                Это не недоработка редактора, а сознательное ограничение формата LSS:
                                автолист умеет собирать числа, но не умеет собирать правила. Текст,
                                который нельзя выразить грантом, пишите в описании способности (trait
                                с <code>description</code>) — игрок прочитает его в спойлере на листе.
                            </p>
                        </AccordionItem>
                    </div>
                </Section>
                <Section title="Помогите улучшить этот гайд">
                    <p className="text-pumpkin-muted leading-relaxed">
                        Здесь не хватает раздела с частыми вопросами. Вы можете помочь, задавая эти вопросы.
                        Хороший вопрос звучит конкретно: «Как добавить способность так, чтобы она выдавалась на определённом уровне?».
                        Задать вопросы можно в соцсетях LSS: <a href="https://discord.gg/ySazTaKu34" className="text-pumpkin-orange hover:underline" target="_blank" rel="noreferrer noopener nofollow">Discord</a>, <a href="https://t.me/rpg_guild" className="text-pumpkin-orange hover:underline" target="_blank" rel="noreferrer noopener nofollow">Telegram</a>, <a href="https://vk.ru/longstoryshortapp" className="text-pumpkin-orange hover:underline" target="_blank" rel="noreferrer noopener nofollow">ВК</a>.
                    </p>
                </Section>
            </div>
        </div>
    );
}
