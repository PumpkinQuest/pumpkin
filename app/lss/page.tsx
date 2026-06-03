import type { Metadata } from "next";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "LSS",
  description: "Live Scenario System — система сценариев живого действия.",
};

export default function LssPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <BookOpen size={24} className="text-pumpkin-orange" />
        <h1 className="text-3xl font-bold tracking-tight">LSS</h1>
      </div>
      <p className="text-pumpkin-muted text-lg">
        Live Scenario System — скоро здесь появятся материалы.
      </p>
    </div>
  );
}
