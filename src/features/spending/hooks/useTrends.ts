import { useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { Pace, Trends } from "../types";

const DEFAULT_PICKS = 4;

export const useTrends = () => {
  const [months, setMonths] = useState(6);
  const [trends, setTrends] = useState<Trends | null>(null);
  const [pace, setPace] = useState<Pace | null>(null);
  const [picked, setPicked] = useState<string[] | null>(null); // null = the biggest ones
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const now = new Date(); // the old chart stays visible while another period loads
    Promise.all([
      fetch(`${API_BASE}/spending/trends?months=${months}`),
      fetch(`${API_BASE}/spending/pace?year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
    ])
      .then(async ([t, p]) => {
        if (!t.ok || !p.ok) throw new Error(`Server returned status ${t.ok ? p.status : t.status}`);
        return [(await t.json()) as Trends, (await p.json()) as Pace] as const;
      })
      .then(([t, p]) => {
        if (cancelled) return;
        setTrends(t);
        setPace(p);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load the comparison"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [months]);

  // Until the household chooses, compare the biggest flexible categories (rent would swamp the rest).
  const defaults = (trends?.categories ?? []).filter((c) => !c.fixed).slice(0, DEFAULT_PICKS).map((c) => c.key);
  const chosen = picked ?? defaults;

  const toggle = (key: string) =>
    setPicked(chosen.includes(key) ? chosen.filter((k) => k !== key) : [...chosen, key]);

  return { months, setMonths, trends, pace, chosen, toggle, loading, error };
};
