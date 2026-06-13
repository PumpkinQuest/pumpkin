import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — Dimension Door",
  description:
    "Какие данные обрабатывает расширение Dimension Door и зачем.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={24} className="text-pumpkin-orange" />
          <h1 className="text-3xl font-bold tracking-tight">Политика конфиденциальности Dimension Door</h1>
        </div>
        <p className="text-pumpkin-muted text-sm">Последнее обновление: 14 июня 2026</p>
      </div>

      <div className="flex flex-col gap-4 text-pumpkin-muted leading-relaxed">
        <p>Dimension Door — браузерное расширение, которое помогает пользователю сохранять описания заклинаний настольных ролевых игр в его личную библиотеку в аккаунте Long Story Short. Эта политика описывает, какие данные расширение обрабатывает и зачем.</p>
        <p>Расширение неофициальное и не связано ни с одним издателем игр.</p>
      </div>

      <div className="flex flex-col gap-8">
        <Section title="Какие данные мы обрабатываем">
          <p className="text-pumpkin-muted leading-relaxed">Расширение обрабатывает данные <strong className="text-pumpkin-text">только когда вы сами инициируете действие</strong> (нажимаете кнопку расширения на странице). Оно не работает в фоне и не отслеживает ваш просмотр сайтов.</p>
          <ol className="list-decimal pl-6 flex flex-col gap-3 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
            <li><strong className="text-pumpkin-text">Данные авторизации.</strong> При входе через ваш аккаунт Long Story Short (защищённый OAuth) расширение получает и хранит токен доступа. Токен хранится локально на вашем устройстве (в хранилище расширения) и используется только для обращения к вашей библиотеке. Расширение не видит и не хранит ваш пароль.</li>
            <li><strong className="text-pumpkin-text">Контент, который вы выбрали сохранить.</strong> Когда вы нажимаете кнопку на странице с заклинанием, расширение считывает только тот фрагмент, который вы решили импортировать, и отправляет его на наш сервис обработки, чтобы преобразовать в структурированную карточку и сохранить её в вашу личную библиотеку. Расширение не считывает остальное содержимое страницы и не собирает контент страниц, которые вы не импортировали.</li>
          </ol>
        </Section>

        <Section title="Какие данные мы НЕ собираем">
          <ul className="list-disc pl-6 flex flex-col gap-1 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
            <li>Историю просмотров и поведение на сайтах.</li>
            <li>Содержимое страниц, которые вы не импортировали явно.</li>
            <li>Персональные данные (имя, адрес, телефон), данные о местоположении, здоровье, финансах.</li>
            <li>Мы не используем аналитику и трекеры в расширении.</li>
          </ul>
        </Section>

        <Section title="Как используются данные">
          <p className="text-pumpkin-muted leading-relaxed">Обрабатываемые данные используются исключительно для того, чтобы выполнить функцию расширения — сохранить выбранное вами заклинание в вашу собственную библиотеку. Мы:</p>
          <ul className="list-disc pl-6 flex flex-col gap-1 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
            <li>не продаём данные третьим лицам;</li>
            <li>не передаём их кому-либо, кроме собственных серверных сервисов, обеспечивающих работу функции;</li>
            <li>не используем их для рекламы, профилирования или оценки кредитоспособности.</li>
          </ul>
        </Section>

        <Section title="Разрешения расширения">
          <ul className="list-disc pl-6 flex flex-col gap-1 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
            <li><strong className="text-pumpkin-text">activeTab / scripting</strong> — доступ к активной вкладке предоставляется только в момент вашего клика, чтобы считать выбранный вами фрагмент. Широких прав на сторонние сайты нет.</li>
            <li><strong className="text-pumpkin-text">storage</strong> — локальное хранение токена авторизации и кэша конфигурации.</li>
            <li><strong className="text-pumpkin-text">identity</strong> — вход в аккаунт через OAuth.</li>
          </ul>
        </Section>

        <Section title="Куда передаются данные">
          <ul className="list-disc pl-6 flex flex-col gap-1 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
            <li>Выбранный фрагмент передаётся нашему сервису обработки для преобразования в структурную карточку.</li>
            <li>Готовая карточка сохраняется в вашу библиотеку в аккаунте Long Story Short.</li>
          </ul>
          <p className="text-pumpkin-muted leading-relaxed">Передача выполняется по защищённому соединению (HTTPS). Сохранённые заклинания доступны только вам в вашем аккаунте.</p>
        </Section>

        <Section title="Хранение">
          <ul className="list-disc pl-6 flex flex-col gap-1 text-pumpkin-muted leading-relaxed marker:text-pumpkin-muted">
            <li>Токен авторизации хранится локально и удаляется при выходе из аккаунта или по истечении срока.</li>
            <li>Сохранённые вами карточки хранятся в вашей библиотеке Long Story Short до тех пор, пока вы сами их не удалите.</li>
          </ul>
        </Section>

        <Section title="Ваши права и обращения">
          <p className="text-pumpkin-muted leading-relaxed">Вы в любой момент можете выйти из аккаунта (расширение удалит локальный токен) и удалить сохранённые карточки в своей библиотеке. По вопросам о данных или о сохранённом контенте (включая обращения о правах на контент) напишите нам: <a href="mailto:peterthepumpkin@proton.me" className="text-pumpkin-orange hover:underline">peterthepumpkin@proton.me</a>.</p>
        </Section>

        <Section title="Дети">
          <p className="text-pumpkin-muted leading-relaxed">Расширение не предназначено для детей младше 16 лет и не собирает данные о них целенаправленно.</p>
        </Section>

        <Section title="Изменения">
          <p className="text-pumpkin-muted leading-relaxed">Мы можем обновлять эту политику; актуальная версия всегда доступна по этому адресу с указанием даты последнего обновления.</p>
        </Section>

        <Section title="Контакт">
          <p className="text-pumpkin-muted leading-relaxed"><a href="mailto:peterthepumpkin@proton.me" className="text-pumpkin-orange hover:underline">peterthepumpkin@proton.me</a> · <a href="https://pumpkin.quest/" className="text-pumpkin-orange hover:underline">pumpkin.quest</a></p>
        </Section>
      </div>
    </div>
  );
}
