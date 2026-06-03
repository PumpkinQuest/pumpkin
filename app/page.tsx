import Link from "next/link";
import { Wrench, BookOpen, ArrowRight } from "lucide-react";

const sections = [
  {
    href: "/tools",
    icon: Wrench,
    title: "Инструменты",
    description: "Утилиты и генераторы для подготовки игр.",
  },
  {
    href: "/lss",
    icon: BookOpen,
    title: "LSS",
    description: "Live Scenario System — система сценариев живого действия.",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-20">
      {/* Hero */}
      <section className="flex flex-col gap-4">
        <h1 className="text-5xl font-bold tracking-tight text-pumpkin-orange">
          PumpkinQuest
        </h1>
        <p className="text-pumpkin-muted text-lg max-w-lg leading-relaxed">
          Инструменты и материалы для ролевых игр живого действия.
        </p>
      </section>

      {/* Nav cards */}
      <section className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 p-6 rounded-xl border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 hover:bg-pumpkin-surface/80 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <Icon
                size={20}
                className="text-pumpkin-orange opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <ArrowRight
                size={16}
                className="text-pumpkin-muted group-hover:text-pumpkin-orange group-hover:translate-x-0.5 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-pumpkin-text">{title}</span>
              <span className="text-sm text-pumpkin-muted leading-relaxed">
                {description}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
