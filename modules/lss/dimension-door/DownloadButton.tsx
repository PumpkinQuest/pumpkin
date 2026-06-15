"use client";

import { Download } from "lucide-react";
import { track } from "@/shared/utils/analytics";

export default function DownloadButton({
  href,
  version,
}: {
  href: string;
  version: string;
}) {
  return (
    <a
      href={href}
      download
      onClick={() => track("dimension_door_download", { version })}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium bg-pumpkin-orange text-pumpkin-bg hover:bg-pumpkin-orange-dim transition-colors self-start"
    >
      <Download size={16} />
      Скачать архив
    </a>
  );
}
