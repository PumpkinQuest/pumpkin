import type { SparkTable, Gender, SparkColumn } from "./types";
import { rollDie } from "./roll";
import { agreeAdj } from "./agreement";

/** Капитализировать первый символ строки */
function capitalize(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Бросить spark-таблицу и вернуть результирующую строку */
export function rollTable(table: SparkTable): string {
  const results: string[] = [];
  const alts: string[] = []; // textAlt для {i~}
  let leadGender: Gender = "masc";

  // Определяем ведущий род из noun-столбца agreeWith
  if (table.agreeWith !== undefined) {
    const nounCol = table.columns[table.agreeWith];
    if (nounCol.role === "noun") {
      const idx = rollDie(nounCol.rows.length);
      const row = nounCol.rows[idx];
      leadGender = row.gender;
      results[table.agreeWith] = row.text;
      alts[table.agreeWith] = row.text;
    }
  }

  // Бросаем все остальные столбцы
  table.columns.forEach((col: SparkColumn, i: number) => {
    if (results[i] !== undefined) return; // уже обработан

    const idx = rollDie(col.rows.length);

    if (col.role === "adjective") {
      results[i] = agreeAdj(col.rows[idx], leadGender);
      alts[i] = results[i];
    } else if (col.role === "noun") {
      const row = col.rows[idx];
      if (table.agreeWith === undefined) {
        leadGender = row.gender;
      }
      results[i] = row.text;
      alts[i] = row.text;
    } else {
      // plain
      const row = col.rows[idx];
      results[i] = row.text;
      alts[i] = row.textAlt ?? row.text;
    }
  });

  // Подставляем по шаблону
  // {i}  → results[i]
  // {i~} → alts[i] (textAlt, fallback на text)
  let output = table.template;
  results.forEach((val, i) => {
    output = output.replace(new RegExp(`\\{${i}~\\}`, "g"), alts[i] ?? val);
    output = output.replace(new RegExp(`\\{${i}\\}`, "g"), val);
  });

  return capitalize(output.trim());
}

/** Возвращает raceId из таблицы npc-race (первый столбец, plain) */
export function rollRace(table: SparkTable): { text: string; raceId: string } {
  const col = table.columns[0];
  if (col.role !== "plain") {
    return { text: "Человек", raceId: "human" };
  }
  const idx = rollDie(col.rows.length);
  const row = col.rows[idx];
  return {
    text: row.text,
    raceId: row.raceId ?? "human",
  };
}
