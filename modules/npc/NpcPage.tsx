import { UserRound } from "lucide-react";
import type { Metadata } from "next";
import NpcGenerator from "./components/NpcGenerator";

export const metadata: Metadata = {
  title: "Генератор NPC | PumpkinQuest",
  description: "Быстрая генерация персонажей для НРИ на основе spark-таблиц.",
};

export default function NpcPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-8">
      {/* Заголовок */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <UserRound size={24} className="text-pumpkin-orange" />
          <h1 className="text-3xl font-bold tracking-tight">Генератор NPC</h1>
        </div>
        <p className="text-pumpkin-muted text-base max-w-lg leading-relaxed">
          Даже если выпал странный результат, не торопись его сбрасывать. Подумай, как такое может быть возможно.
        </p>
      </div>

      {/* Генератор (клиентский компонент) */}
      <NpcGenerator />
    </div>
  );
}
