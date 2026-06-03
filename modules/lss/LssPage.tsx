import { BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Материалы для LSS",
  description: "Материалы для листа Long Story Short",
};

export default function LssPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <BookOpen size={24} className="text-pumpkin-orange" />
        <h1 className="text-3xl font-bold tracking-tight">LSS</h1>
      </div>
      <p className="text-pumpkin-muted text-lg">
        Скоро будет
      </p>
    </div>
  );
}
