"use client";

import { useState } from "react";
import { FileJson, Download } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import SpellCredits from "./SpellCredits";
import { SPELL_FILES, type Edition } from "./constants";

const EDITIONS: Edition[] = ["2014", "2024"];

export default function SpellsPage() {
  const [edition, setEdition] = useState<Edition>("2024");
  const files = SPELL_FILES[edition];

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "LSS", href: "/lss" },
            { label: "Файлы JSON" },
          ]}
        />
        <div className="flex items-center gap-3">
          <FileJson size={24} className="text-pumpkin-orange" />
          <h1 className="text-3xl font-bold tracking-tight">Файлы заклинаний</h1>
        </div>
      </div>

      <div className="flex gap-2">
        {EDITIONS.map((ed) => (
          <button
            key={ed}
            onClick={() => setEdition(ed)}
            className={
              ed === edition
                ? "px-4 py-1.5 rounded-md text-sm font-medium bg-pumpkin-orange text-pumpkin-bg"
                : "px-4 py-1.5 rounded-md text-sm font-medium border border-pumpkin-border text-pumpkin-muted hover:text-pumpkin-text hover:border-pumpkin-orange transition-colors"
            }
          >
            {ed}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {files.map((file) => (
          <li key={file.slug}>
            <a
              href={file.path}
              download
              className="group flex flex-col gap-3 p-6 rounded-xl border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 hover:bg-pumpkin-surface/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <FileJson size={20} className="text-pumpkin-orange opacity-80 group-hover:opacity-100 transition-opacity" />
                <Download size={16} className="text-pumpkin-muted group-hover:text-pumpkin-orange transition-all duration-200" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-pumpkin-text">{file.name}</span>
                <span className="text-sm text-pumpkin-muted">{file.description}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
      <SpellCredits />
    </div>
  );
}
