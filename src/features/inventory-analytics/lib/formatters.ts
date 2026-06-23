export const formatEuro = (value: number): string =>
  `${value.toFixed(2)} €`;

export const formatDays = (days: number): string =>
  `${days.toFixed(1)} days`;

export const formatPercent = (value: number, decimals = 1): string =>
  `${value.toFixed(decimals)}%`;

export const formatPlusMinus = (value: number): string =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export const formatCategoryLabel = (key: string): string =>
  key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());