"use client";

import { useState, useEffect, useCallback } from "react";
import { UserRound, RefreshCw, Trash2 } from "lucide-react";

import type { Npc } from "../lib/types";
import { generateNpc, rerollField } from "../lib/generateNpc";
import { loadHistory, saveNpc, clearHistory, updateNpc } from "../lib/storage";
import NpcCard from "./NpcCard";

// Статические импорты JSON-данных
import raceTable       from "@/app/data/spark/tables/npc-race.json";
import professionTable from "@/app/data/spark/tables/npc-profession.json";
import appearanceTable from "@/app/data/spark/tables/npc-appearance.json";
import quirkTable      from "@/app/data/spark/tables/npc-quirk.json";
import ambitionTable   from "@/app/data/spark/tables/npc-ambition.json";
import driveTable      from "@/app/data/spark/tables/npc-drive.json";
import secretTable     from "@/app/data/spark/tables/npc-secret.json";
import questTable      from "@/app/data/spark/tables/quest.json";
import connectionTable from "@/app/data/spark/tables/npc-connection.json";
import nameData        from "@/app/data/spark/names.json";

import type { SparkTable, NameData } from "../lib/types";
import { track } from "@/shared/utils/analytics";

const tables: Record<string, SparkTable> = {
  "npc-race":        raceTable       as SparkTable,
  "npc-profession":  professionTable as SparkTable,
  "npc-appearance":  appearanceTable as SparkTable,
  "npc-quirk":       quirkTable      as SparkTable,
  "npc-ambition":    ambitionTable   as SparkTable,
  "npc-drive":       driveTable      as SparkTable,
  "npc-secret":      secretTable     as SparkTable,
  "quest":           questTable      as SparkTable,
  "npc-connection":  connectionTable as SparkTable,
};

export default function NpcGenerator() {
  const [history, setHistory] = useState<Npc[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setMounted(true);
  }, []);

  const handleGenerate = useCallback(() => {
    const npc = generateNpc(tables, nameData as NameData);
    const next = saveNpc(npc);
    setHistory(next);
    track("npc_generate");
  }, []);

  const handleClear = useCallback(() => {
    const remaining = clearHistory();
    setHistory(remaining);
    track("npc_clear_history");
  }, []);

  const handleToggleLock = useCallback((npcId: string) => {
    setHistory((prev) => {
      const npc = prev.find((n) => n.id === npcId);
      if (!npc) return prev;
      const updated = { ...npc, locked: !npc.locked };
      const next = prev.map((n) => (n.id === npcId ? updated : n));
      updateNpc(updated);
      if (updated.locked) track("npc_lock");
      return next;
    });
  }, []);

  const handleReroll = useCallback((npcId: string, label: string) => {
    setHistory((prev) => {
      const npc = prev.find((n) => n.id === npcId);
      if (!npc) return prev;
      const updated = rerollField(npc, label, tables, nameData as NameData);
      const next = prev.map((n) => (n.id === npcId ? updated : n));
      updateNpc(updated);
      track("npc_reroll_field", { field: label });
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Кнопки управления */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pumpkin-orange hover:bg-pumpkin-orange-dim text-pumpkin-bg font-semibold text-sm transition-colors duration-200"
        >
          <UserRound size={16} />
          Сгенерировать
        </button>

        {mounted && history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-pumpkin-border bg-pumpkin-surface hover:border-pumpkin-orange/40 text-pumpkin-muted hover:text-pumpkin-text text-sm transition-all duration-200"
          >
            <Trash2 size={14} />
            Очистить историю
          </button>
        )}
      </div>

      {/* Подсказка если история пуста */}
      {mounted && history.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <RefreshCw size={32} className="text-pumpkin-muted opacity-40" />
          <p className="text-pumpkin-muted text-sm">
            Нажмите «Сгенерировать», чтобы создать первого персонажа
          </p>
        </div>
      )}

      {/* Лента персонажей — новые сверху */}
      {mounted && history.length > 0 && (
        <div className="flex flex-col gap-4">
          {history.map((npc) => (
            <NpcCard key={npc.id} npc={npc} onReroll={handleReroll} onToggleLock={handleToggleLock} />
          ))}
        </div>
      )}
    </div>
  );
}
