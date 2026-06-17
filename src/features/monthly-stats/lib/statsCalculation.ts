export interface TrendDelta {
  absoluteChange: number;
  percentChange: number | null; // null when previous value was 0 (undefined % change)
  direction: "up" | "down" | "flat";
}

export function calculateTrend(
  current: number,
  previous: number,
): TrendDelta {
  const absoluteChange = current - previous;

  const percentChange =
    previous === 0 ? null : (absoluteChange / Math.abs(previous)) * 100;

  const direction: TrendDelta["direction"] =
    absoluteChange === 0 ? "flat" : absoluteChange > 0 ? "up" : "down";

  return { absoluteChange, percentChange, direction };
}

export function formatEuro(value: number, withSign = false): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}€`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}