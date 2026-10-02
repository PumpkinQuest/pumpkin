"use client";

import { Puzzle } from "lucide-react";
import { track } from "@/shared/utils/analytics";

export default function StoreButton({
  href,
  store,
  label,
}: {
  href: string;
  store: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("dimension_door_store_click", { store })}
      className="flex flex-1 items-center justify-center gap-2 px-5 py-3 rounded-xl border border-pumpkin-orange bg-pumpkin-surface hover:bg-pumpkin-orange/10 transition-colors font-semibold text-pumpkin-text"
    >
      <Puzzle size={18} className="text-pumpkin-orange" />
      {label}
    </a>
  );
}
