import type { NameData, RaceNameSet, Syllable, Onset } from "./types";
import { pickRandom } from "./roll";

/** Найти слог с нужным startsWith; если нет — любой */
function pickSyllableByStart(pool: Syllable[], want: Onset): Syllable {
  const candidates = pool.filter((s) => s.startsWith === want);
  return candidates.length > 0 ? pickRandom(candidates) : pickRandom(pool);
}

/** Генерировать имя для расы raceId */
export function generateName(raceId: string, nameData: NameData): string {
  const set: RaceNameSet = nameData[raceId] ?? nameData["human"];

  // Префикс — случайный
  const prefix = pickRandom(set.prefix);
  let name = prefix.text;
  let lastEnd: Onset | undefined = prefix.endsWith;

  // Число серединных слогов: 0, 1 или 2
  const midCount = Math.floor(Math.random() * 3); // 0..2
  for (let i = 0; i < midCount; i++) {
    const want: Onset = lastEnd === "v" ? "c" : "v";
    const mid = set.middle.length > 0
      ? pickSyllableByStart(set.middle, want)
      : null;
    if (mid) {
      name += mid.text;
      lastEnd = mid.endsWith;
    }
  }

  // Суффикс с подходящим стыком
  const wantSuffix: Onset = lastEnd === "v" ? "c" : "v";
  const suffix = pickSyllableByStart(set.suffix, wantSuffix);
  name += suffix.text;

  // Первая буква в верхний регистр (уже есть в prefix, но на всякий случай)
  return name.charAt(0).toUpperCase() + name.slice(1);
}
