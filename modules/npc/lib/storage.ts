import type { Npc } from "./types";

const STORAGE_KEY = "pumpkin_npc_history";

/** Прочитать историю из localStorage (безопасно для SSR) */
export function loadHistory(): Npc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Npc[];
  } catch {
    return [];
  }
}

/** Добавить NPC в начало истории и сохранить */
export function saveNpc(npc: Npc): Npc[] {
  const history = loadHistory();
  const next = [npc, ...history];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage может быть переполнен — игнорируем
  }
  return next;
}

/** Обновить конкретный NPC в истории (после reroll поля или смены locked) */
export function updateNpc(npc: Npc): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  const next = history.map((n) => (n.id === npc.id ? npc : n));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

/** Очистить историю, оставив заблокированных NPC */
export function clearHistory(): Npc[] {
  if (typeof window === "undefined") return [];
  const history = loadHistory();
  const locked = history.filter((n) => n.locked);
  try {
    if (locked.length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locked));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
  return locked;
}
