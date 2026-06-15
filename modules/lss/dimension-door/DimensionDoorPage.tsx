import Image, { type StaticImageData } from "next/image";
import { DoorOpen } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import DownloadButton from "./DownloadButton";

import chromeScreen1 from "./img/chrome1.jpg";
import chromeScreen2 from "./img/chrome2.jpg";
import chromeScreen3 from "./img/chrome3.jpg";

import screen1 from "./img/screen1.jpg";
import screen2 from "./img/screen2.jpg";
import screen3 from "./img/screen3.jpg";

const ARCHIVE_PATH = "/archives/dimension-door-0.2.0.zip";
const VERSION = "0.2.0";

function Screenshot({
  src,
  alt,
}: {
  src: StaticImageData;
  alt: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      className="rounded-lg border border-pumpkin-border w-full h-auto"
    />
  );
}

function Step({
  num,
  children,
}: {
  num: number;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex-none flex items-center justify-center w-7 h-7 rounded-full border border-pumpkin-border text-sm font-medium text-pumpkin-orange">
        {num}
      </span>
      <div className="flex flex-col gap-3 pt-0.5 min-w-0">{children}</div>
    </li>
  );
}

const TAB_LABEL =
  "px-4 py-2.5 text-sm font-medium cursor-pointer border-b-2 border-transparent -mb-px transition-colors text-pumpkin-muted hover:text-pumpkin-text";

function InstallSteps() {
  return (
    <ol className="flex flex-col gap-8">
      <Step num={1}>
        <p className="text-pumpkin-muted leading-relaxed">
          Скачайте архив с расширением и распакуйте его в постоянную папку —
          Chrome загружает расширение из этой папки, поэтому её нельзя удалять
          или перемещать после установки.
        </p>
      </Step>

      <Step num={2}>
        <p className="text-pumpkin-muted leading-relaxed">
          Откройте страницу{" "}
          <code className="px-1.5 py-0.5 rounded bg-pumpkin-surface border border-pumpkin-border text-pumpkin-text text-sm">
            chrome://extensions
          </code>{" "}
          и включите{" "}
          <strong className="text-pumpkin-text">Режим разработчика</strong> в
          правом верхнем углу.
        </p>
        <Screenshot src={chromeScreen1} alt="Включение режима разработчика" />
      </Step>

      <Step num={3}>
        <p className="text-pumpkin-muted leading-relaxed">
          Нажмите{" "}
          <strong className="text-pumpkin-text">
            Загрузить распакованное расширение
          </strong>{" "}
          и выберите папку, в которую вы распаковали архив.
        </p>
        <Screenshot src={chromeScreen2} alt="Загрузка распакованного расширения" />
      </Step>

      <Step num={4}>
        <p className="text-pumpkin-muted leading-relaxed">
          Расширение появится в списке. Закрепите его на панели инструментов
          через иконку с пазлом, чтобы кнопка всегда была под рукой.
        </p>
        <Screenshot src={chromeScreen3} alt="Закрепление расширения на панели" />
      </Step>
    </ol>
  );
}

function UsageSteps() {
  return (
    <ol className="flex flex-col gap-8">
      <Step num={1}>
        <p className="text-pumpkin-muted leading-relaxed">
          Откройте страницу с заклинанием на dnd.su и
          нажмите на иконку расширения. При первом запуске потребуется вход в
          аккаунт Long Story Short.
        </p>
        <Screenshot src={screen1} alt="Вход в аккаунт Long Story Short" />
      </Step>

      <Step num={2}>
        <p className="text-pumpkin-muted leading-relaxed">
          После входа расширение само считывает заклинание с открытой страницы и
          показывает его название и редакцию.
        </p>
        <Screenshot src={screen2} alt="Распознанное заклинание в окне расширения" />
      </Step>

      <Step num={3}>
        <p className="text-pumpkin-muted leading-relaxed">
          Нажмите{" "}
          <strong className="text-pumpkin-text">Импортировать</strong> — карточка
          сохранится в вашу библиотеку. Если заклинание уже есть в гримуаре,
          расширение пометит его как добавленное.
        </p>
        <Screenshot src={screen3} alt="Успешный импорт заклинания" />
      </Step>
    </ol>
  );
}

export default function DimensionDoorPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "LSS", href: "/lss" },
            { label: "Dimension Door" },
          ]}
        />
        <div className="flex items-center gap-3">
          <DoorOpen size={24} className="text-pumpkin-orange" />
          <h1 className="text-3xl font-bold tracking-tight">Dimension Door</h1>
        </div>
        <p className="text-pumpkin-muted leading-relaxed">
          Браузерное расширение для Chrome, которое сохраняет описания заклинаний
          из компендиумов в вашу библиотеку Long Story Short. Расширение читает
          страницу только в момент вашего клика по его кнопке.
        </p>
        <p className="text-pumpkin-muted leading-relaxed">
          Поддерживаемые компендиумы: <a className="text-pumpkin-orange" href="https://dnd.su/spells/" target="__blank" rel="nofollow noreferrer noopener">dnd.su</a>
        </p>
      </div>

      <div className="flex flex-col gap-4 p-6 rounded-xl border border-pumpkin-border bg-pumpkin-surface">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-pumpkin-text">
            Dimension Door {VERSION}
          </span>
          <span className="text-sm text-pumpkin-muted">
            Архив с расширением для Chrome
          </span>
        </div>
        <DownloadButton href={ARCHIVE_PATH} version={VERSION} />
      </div>

      <div className="group/tabs flex flex-col gap-6">
        <input type="radio" name="dd-tab" id="dd-tab-install" defaultChecked className="hidden" />
        <input type="radio" name="dd-tab" id="dd-tab-usage" className="hidden" />

        <div className="flex gap-2 border-b border-pumpkin-border">
          <label
            htmlFor="dd-tab-install"
            className={`${TAB_LABEL} group-has-[#dd-tab-install:checked]/tabs:text-pumpkin-text group-has-[#dd-tab-install:checked]/tabs:border-pumpkin-orange`}
          >
            Установка в Chrome
          </label>
          <label
            htmlFor="dd-tab-usage"
            className={`${TAB_LABEL} group-has-[#dd-tab-usage:checked]/tabs:text-pumpkin-text group-has-[#dd-tab-usage:checked]/tabs:border-pumpkin-orange`}
          >
            Использование
          </label>
        </div>

        <div className="hidden group-has-[#dd-tab-install:checked]/tabs:block">
          <InstallSteps />
        </div>
        <div className="hidden group-has-[#dd-tab-usage:checked]/tabs:block">
          <UsageSteps />
        </div>
      </div>
    </div>
  );
}

