import type { Metadata } from "next";
import { Wrench } from "lucide-react";

export const metadata: Metadata = {
  title: "Инструменты",
  description: "Утилиты и генераторы для подготовки ролевых игр.",
};

export default function ToolsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Wrench size={24} className="text-pumpkin-orange" />
        <h1 className="text-3xl font-bold tracking-tight">Инструменты</h1>
      </div>
      <p className="text-pumpkin-muted text-lg">Скоро здесь появятся инструменты.</p>
    </div>
  );
}
