import Image, { type StaticImageData } from "next/image";
import { DoorOpen } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import StoreButton from "./StoreButton";

import screen1 from "./img/screen1.jpg";
import screen2 from "./img/screen2.jpg";
import screen3 from "./img/screen3.jpg";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/dimension-door/akabajjhfjmooihjpppjgialacocghkp";

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
          из компендиумов в вашу библиотеку Long Story Short.
        </p>
        <p className="text-pumpkin-muted leading-relaxed">
          Поддерживаемые компендиумы: <a className="text-pumpkin-orange" href="https://dnd.su/spells/" target="__blank" rel="nofollow noreferrer noopener">dnd.su</a>
        </p>
      </div>

      <StoreButton href={CHROME_STORE_URL} />

      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold tracking-tight">Как пользоваться</h2>
        <UsageSteps />
      </div>
    </div>
  );
}

