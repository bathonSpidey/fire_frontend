import type { MonthlyStatsResponse } from "../types";

const STATS_BASE_URL = "http://localhost:8000/stats/";

/**
 * Fetches monthly stats for a single period.
 * Returns null for both "no data" (404/empty) and any network failure,
 * since callers treat both as an empty state when fetching trend
 * comparison data — a missing previous month should not break the page.
 */
export async function fetchMonthlyStats(
  month: string,
  year: number,
): Promise<MonthlyStatsResponse | null> {
  const url = `${STATS_BASE_URL}?month=${month}&year=${year}`;

  const res = await fetch(url, { headers: { accept: "application/json" } });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as MonthlyStatsResponse;
}