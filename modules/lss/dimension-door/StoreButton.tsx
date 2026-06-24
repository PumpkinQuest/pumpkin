"use client";

import { track } from "@/shared/utils/analytics";

export default function StoreButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("dimension_door_store_click")}
      className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-pumpkin-orange bg-pumpkin-surface hover:bg-pumpkin-orange/10 transition-colors font-semibold text-pumpkin-text"
    >
      Установить из Chrome Web Store
    </a>
  );
}
