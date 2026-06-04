import type { AdjForms, Gender } from "./types";

/** Вернуть форму прилагательного по роду */
export function agreeAdj(forms: AdjForms, gender: Gender): string {
  return forms[gender];
}
