import { useState, useEffect } from "react";
import type { MonthlyStatsResponse } from "../types";
import { fetchMonthlyStats } from "../lib/statsApi";
import { getPreviousMonth } from "../lib/monthMath";

interface UseMonthlyStatsResult {
  stats: MonthlyStatsResponse | null;
  previousStats: MonthlyStatsResponse | null;
  loading: boolean;
  error: string | null;
}

export const useMonthlyStats = (
  month: string,
  year: number,
): UseMonthlyStatsResult => {
  const [stats, setStats] = useState<MonthlyStatsResponse | null>(null);
  const [previousStats, setPreviousStats] =
    useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const loadStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const { month: prevMonth, year: prevYear } = getPreviousMonth(
          month,
          year,
        );

        const [currentResult, previousResult] = await Promise.all([
          fetchMonthlyStats(month, year),
          fetchMonthlyStats(prevMonth, prevYear),
        ]);

        if (!isCurrent) return;

        setStats(currentResult);
        setPreviousStats(previousResult);
      } catch (err) {
        if (!isCurrent) return;
        setError(err instanceof Error ? err.message : "Failed to fetch metrics");
        setStats(null);
        setPreviousStats(null);
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    loadStats();

    return () => {
      isCurrent = false;
    };
  }, [month, year]);

  return { stats, previousStats, loading, error };
};