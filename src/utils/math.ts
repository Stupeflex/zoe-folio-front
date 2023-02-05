export const isBetween = (n: number, min: number, max: number) =>
  n <= max && n >= min;

export function isDefined<T = unknown>(n: T | undefined): n is T {
  return n !== undefined;
}
