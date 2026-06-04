import { DoorOpen } from "lucide-react";
import type { Metadata } from "next";
import Breadcrumbs from "@/shared/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Dimension Door — LSS",
  description: "Dimension Door",
};

export default function DimensionDoorPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-10">
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
      </div>
      <p className="text-pumpkin-muted text-lg">В разработке</p>
    </div>
  );
}
