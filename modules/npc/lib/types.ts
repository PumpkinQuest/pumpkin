export type Gender = "masc" | "neut" | "fem" | "plur";

export type AdjForms = Record<Gender, string>;

export type Onset = "v" | "c"; // гласный / согласный

export type SparkColumn =
  | { role: "adjective"; die: number; rows: AdjForms[] }
  | { role: "noun"; die: number; rows: { text: string; gender: Gender }[] }
  | {
      role: "plain";
      die: number;
      rows: {
        text: string;
        /** Альтернативная форма слова (напр. именительный падеж), используется в шаблоне как {i~} */
        textAlt?: string;
        /** raceId для таблицы npc-race */
        raceId?: string;
      }[];
    };

export interface SparkTable {
  id: string;
  title: string;
  /**
   * Шаблон результата. Поддерживает:
   * - {i}  — текст i-го столбца
   * - {i~} — textAlt i-го столбца (если нет — fallback на text)
   */
  template: string;
  agreeWith?: number;
  columns: SparkColumn[];
}

export interface Syllable {
  text: string;
  startsWith?: Onset;
  endsWith?: Onset;
}

export interface RaceNameSet {
  prefix: Syllable[];
  middle: Syllable[];
  suffix: Syllable[];
}

export type NameData = Record<string, RaceNameSet>;

export interface NpcField {
  label: string;
  value: string;
}

export interface Npc {
  id: string;
  createdAt: number;
  /** raceId для перегенерации имени без смены расы */
  raceId: string;
  fields: NpcField[];
  /** Заблокирован — не удаляется при очистке истории */
  locked?: boolean;
}
