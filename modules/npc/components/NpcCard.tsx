import { Lock, LockOpen } from "lucide-react";
import type { Npc, NpcField } from "../lib/types";
import NpcFieldRow from "./NpcField";

interface NpcCardProps {
  npc: Npc;
  onReroll: (npcId: string, label: string) => void;
  onToggleLock: (npcId: string) => void;
}

const RerollIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

/** Рендерит сгруппированный блок «Желание» = Амбиция · Мотив */
function DesireGroup({
  ambition,
  drive,
  onRerollAmbition,
  onRerollDrive,
}: {
  ambition: NpcField;
  drive: NpcField;
  onRerollAmbition: () => void;
  onRerollDrive: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-pumpkin-muted uppercase tracking-wider">
          Желание
        </span>
        <button
          onClick={onRerollAmbition}
          title="Перегенерировать: Амбиция"
          className="p-0.5 rounded text-pumpkin-muted hover:text-pumpkin-orange transition-colors duration-150"
        >
          <RerollIcon />
        </button>
        <button
          onClick={onRerollDrive}
          title="Перегенерировать: Мотив"
          className="p-0.5 rounded text-pumpkin-muted hover:text-pumpkin-orange transition-colors duration-150"
        >
          <RerollIcon />
        </button>
      </div>
      <div className="text-sm text-pumpkin-text leading-relaxed">
        <span>{ambition.value}</span>
        <span className="text-pumpkin-muted"> (мотивация: </span>
        <span>{drive.value})</span>
      </div>
    </div>
  );
}

export default function NpcCard({ npc, onReroll, onToggleLock }: NpcCardProps) {
  const nameField     = npc.fields.find((f) => f.label === "Имя");
  const ambitionField = npc.fields.find((f) => f.label === "Амбиция");
  const driveField    = npc.fields.find((f) => f.label === "Мотив");

  const gridFields = npc.fields.filter(
    (f) => f.label !== "Имя" && f.label !== "Амбиция" && f.label !== "Мотив"
  );

  const secretIdx = gridFields.findIndex((f) => f.label === "Секрет");
  const insertAt = secretIdx >= 0 ? secretIdx : gridFields.length;

  return (
    <article className="relative flex flex-col gap-4 p-5 rounded-xl border border-pumpkin-border bg-pumpkin-surface">
      {/* Кнопка замка — верхний правый угол */}
      <button
        onClick={() => onToggleLock(npc.id)}
        title={npc.locked ? "Снять защиту (NPC будет удалён при очистке)" : "Защитить от удаления при очистке"}
        className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors duration-150 ${
          npc.locked
            ? "text-pumpkin-orange bg-pumpkin-orange/10 hover:bg-pumpkin-orange/20"
            : "text-pumpkin-muted hover:text-pumpkin-orange hover:bg-pumpkin-orange/10"
        }`}
      >
        {npc.locked ? <Lock size={14} /> : <LockOpen size={14} />}
      </button>

      {nameField && (
        <NpcFieldRow
          field={nameField}
          isName
          onReroll={() => onReroll(npc.id, "Имя")}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {gridFields.slice(0, insertAt).map((field) => (
          <NpcFieldRow
            key={field.label}
            field={field}
            onReroll={() => onReroll(npc.id, field.label)}
          />
        ))}

        {ambitionField && driveField && (
          <DesireGroup
            ambition={ambitionField}
            drive={driveField}
            onRerollAmbition={() => onReroll(npc.id, "Амбиция")}
            onRerollDrive={() => onReroll(npc.id, "Мотив")}
          />
        )}

        {gridFields.slice(insertAt).map((field) => (
          <NpcFieldRow
            key={field.label}
            field={field}
            onReroll={() => onReroll(npc.id, field.label)}
          />
        ))}
      </div>
    </article>
  );
}
