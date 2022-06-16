export const formatNumber = (index: number): string =>
  index < 10 ? '0' + index.toString() : String(index);
