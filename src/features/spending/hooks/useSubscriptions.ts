import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { Frequency, Subscriptions } from "../types";

export const useSubscriptions = () => {
  const [data, setData] = useState<Subscriptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/spending/subscriptions`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        return res.json() as Promise<Subscriptions>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load subscriptions"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // The server answers with the recalculated list, so every total on the page stays consistent.
  const decide = useCallback(async (key: string, rule: { frequency?: Frequency | null; hidden?: boolean }) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/spending/subscriptions/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency: rule.frequency ?? null, hidden: rule.hidden ?? false }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Request failed (status ${res.status})`);
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
    }
  }, []);

  return { data, loading, error, decide };
};
