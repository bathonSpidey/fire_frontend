import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { MonthSpending } from "../types";

export const useSpending = () => {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1);
  const [year, setYear] = useState<number>(now.getFullYear());
  const [data, setData] = useState<MonthSpending | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [recheckMessage, setRecheckMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/spending/month?year=${year}&month=${month}`);
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const json: MonthSpending = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load spending");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [year, month, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const nowIndex = now.getFullYear() * 12 + now.getMonth();
  const canGoNext = year * 12 + (month - 1) < nowIndex; // nothing is paid in advance

  const step = (delta: number) => {
    if (delta > 0 && !canGoNext) return;
    const index = year * 12 + (month - 1) + delta;
    setYear(Math.floor(index / 12));
    setMonth((index % 12) + 1);
  };

  // Ask Claude to categorize everything that has no category yet (runs in the background).
  const categorizeUncategorized = async () => {
    setRecheckMessage(null);
    const res = await fetch(`${API_BASE}/categories/recheck`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from_categories: [], include_uncategorized: true }),
    });
    if (!res.ok) {
      setRecheckMessage("Could not start the re-check.");
      return;
    }
    const json = await res.json();
    setRecheckMessage(
      json.job_id
        ? `Claude is categorizing ${json.entries} entries in the background. Refresh in a minute.`
        : "Nothing to categorize.",
    );
  };

  return {
    month, year, data, loading, error, reload, recheckMessage, canGoNext,
    handlePrev: () => step(-1),
    handleNext: () => step(1),
    categorizeUncategorized,
  };
};
