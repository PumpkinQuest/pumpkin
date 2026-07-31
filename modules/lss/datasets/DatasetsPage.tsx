"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileJson, Download, ExternalLink } from "lucide-react";
import Breadcrumbs from "@/shared/components/Breadcrumbs";
import DatasetCredits from "./DatasetCredits";
import { DATASET_FILES, type Edition } from "./constants";
import { track } from "@/shared/utils/analytics";

const EDITIONS: Edition[] = ["2014", "2024"];

export default function DatasetsPage() {
  const [edition, setEdition] = useState<Edition>("2024");
  const router = useRouter();
  const files = DATASET_FILES[edition];

  const handleOpenInEditor = async (file: (typeof files)[number]) => {
    const res = await fetch(file.path);
    const text = await res.text();
    sessionStorage.setItem("pendingDatasetImport", text);
    router.push("/lss/dataset-editor");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "LSS", href: "/lss" },
            { label: "Датасеты JSON" },
          ]}
        />
        <div className="flex items-center gap-3">
          <FileJson size={24} className="text-pumpkin-orange" />
          <h1 className="text-3xl font-bold tracking-tight">Датасеты JSON</h1>
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

      {files.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {files.map((file) => (
            <li key={file.slug}>
              <div className="group flex flex-col gap-3 p-6 rounded-xl border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 hover:bg-pumpkin-surface/80 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <FileJson size={20} className="text-pumpkin-orange opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2">
                    <a
                      href={file.path}
                      download
                      onClick={() => track("dataset_download", { book: file.slug, edition })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-pumpkin-border text-pumpkin-muted hover:text-pumpkin-text hover:border-pumpkin-orange/50 transition-all duration-200"
                    >
                      <Download size={14} />
                      Скачать
                    </a>
                    <button
                      onClick={() => handleOpenInEditor(file)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-pumpkin-orange hover:bg-pumpkin-orange-dim text-pumpkin-bg transition-colors duration-200"
                    >
                      <ExternalLink size={14} />
                      Открыть в редакторе
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-pumpkin-text">{file.name}</span>
                  <span className="text-sm text-pumpkin-muted">{file.description}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FileJson size={48} className="text-pumpkin-muted opacity-30" />
          <p className="text-pumpkin-muted text-sm">
            Для этой редакции пока нет файлов.
          </p>
        </div>
      )}

      <DatasetCredits />
    </div>
  );
}
