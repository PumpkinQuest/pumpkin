import Link from "next/link";
import { BookOpen, FileJson, DoorOpen, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumbs from "@/shared/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "LSS — PumpkinQuest",
  description: "Материалы для листа Long Story Short",
};

const sections = [
  {
    href: "/lss/spells",
    icon: FileJson,
    title: "Файлы JSON",
    description: "Файлы заклинаний для LSS",
  },
//   {
//     href: "/lss/dimension-door",
//     icon: DoorOpen,
//     title: "Dimension Door",
//     description: "В разработке",
//   },
];

export default function LssPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "LSS" }]} />
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-pumpkin-orange" />
          <h1 className="text-3xl font-bold tracking-tight">LSS</h1>
        </div>
      </div>

      <section className="grid sm:grid-cols-2 gap-4">
        {sections.map(({ href, icon: Icon, title, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-3 p-6 rounded-xl border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 hover:bg-pumpkin-surface/80 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <Icon size={20} className="text-pumpkin-orange opacity-80 group-hover:opacity-100 transition-opacity" />
              <ArrowRight size={16} className="text-pumpkin-muted group-hover:text-pumpkin-orange group-hover:translate-x-0.5 transition-all duration-200" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-pumpkin-text">{title}</span>
              <span className="text-sm text-pumpkin-muted leading-relaxed">{description}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}
