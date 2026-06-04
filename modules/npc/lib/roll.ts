/** Бросок кубика: возвращает целое число от 0 до (die-1) */
export function rollDie(die: number): number {
  return Math.floor(Math.random() * die);
}

/** Выбрать случайный элемент из массива */
export function pickRandom<T>(arr: T[]): T {
  return arr[rollDie(arr.length)];
}
