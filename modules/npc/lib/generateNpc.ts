import type { Npc, NpcField, SparkTable, NameData } from "./types";
import { rollTable, rollRace } from "./generateTable";
import { generateName } from "./generateName";

/** Маппинг label → tableId для перегенерации отдельного поля */
const FIELD_TABLE: Record<string, string> = {
  "Профессия": "npc-profession",
  "Внешность": "npc-appearance",
  "Причуда":   "npc-quirk",
  "Амбиция":   "npc-ambition",
  "Мотив":     "npc-drive",
  "Секрет":    "npc-secret",
  "Квест":     "quest",
  "Связи":     "npc-connection",
};

/** Собрать полного NPC из набора таблиц */
export function generateNpc(
  tables: Record<string, SparkTable>,
  nameData: NameData
): Npc {
  // 1. Раса — первой, даёт raceId
  const raceResult = rollRace(tables["npc-race"]);

  // 2. Имя по расе
  const name = generateName(raceResult.raceId, nameData);

  // 3. Поля в нужном порядке
  const fields: NpcField[] = [
    { label: "Имя",        value: name },
    { label: "Раса",       value: raceResult.text },
    { label: "Профессия",  value: rollTable(tables["npc-profession"]) },
    { label: "Внешность",  value: rollTable(tables["npc-appearance"]) },
    { label: "Причуда",    value: rollTable(tables["npc-quirk"]) },
    { label: "Амбиция",    value: rollTable(tables["npc-ambition"]) },
    { label: "Мотив",      value: rollTable(tables["npc-drive"]) },
    { label: "Секрет",     value: rollTable(tables["npc-secret"]) },
    { label: "Квест",      value: rollTable(tables["quest"]) },
    { label: "Связи",      value: rollTable(tables["npc-connection"]) },
  ];

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    raceId: raceResult.raceId,
    fields,
  };
}

/**
 * Перегенерировать одно поле NPC по его label.
 * Возвращает новый объект Npc с обновлённым полем.
 */
export function rerollField(
  npc: Npc,
  label: string,
  tables: Record<string, SparkTable>,
  nameData: NameData
): Npc {
  let newValue: string;

  if (label === "Имя") {
    newValue = generateName(npc.raceId, nameData);
  } else if (label === "Раса") {
    // Перегенерация расы меняет и raceId (но НЕ имя автоматически)
    const raceResult = rollRace(tables["npc-race"]);
    const updatedFields = npc.fields.map((f) =>
      f.label === "Раса" ? { ...f, value: raceResult.text } : f
    );
    return { ...npc, raceId: raceResult.raceId, fields: updatedFields };
  } else {
    const tableId = FIELD_TABLE[label];
    if (!tableId || !tables[tableId]) return npc;
    newValue = rollTable(tables[tableId]);
  }

  const updatedFields = npc.fields.map((f) =>
    f.label === label ? { ...f, value: newValue } : f
  );
  return { ...npc, fields: updatedFields };
}
