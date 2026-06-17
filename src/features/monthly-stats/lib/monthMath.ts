const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export interface MonthYear {
  month: string;
  year: number;
}

/**
 * Returns the previous calendar month, rolling over the year boundary.
 * e.g. ("Jan", 2026) -> ("Dec", 2025)
 *
 * Throws if `month` isn't a recognized 3-letter month name, since silently
 * returning a wrong period would corrupt the trend comparison.
 */
export function getPreviousMonth(month: string, year: number): MonthYear {
  const index = MONTH_NAMES.indexOf(month);

  if (index === -1) {
    throw new Error(`Unrecognized month label: "${month}"`);
  }

  if (index === 0) {
    return { month: "Dec", year: year - 1 };
  }

  return { month: MONTH_NAMES[index - 1], year };
}