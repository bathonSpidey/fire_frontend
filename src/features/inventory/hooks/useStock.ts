import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { Insights, StockItem, StockSummary } from "../types";

interface ItemPatch {
  location?: string | null;
  date_expiry?: string | null;
  rating?: number | null;
  would_rebuy?: boolean | null;
}

async function call<T>(path: string, method: "GET" | "POST" | "PATCH" = "GET", body?: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `Request failed (status ${res.status})`);
  }
  return res.json();
}

export const useStock = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [summary, setSummary] = useState<StockSummary | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [insightDays, setInsightDays] = useState(90);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  // Things finished in this session: the page asks how they were, then lets them go.
  const [toRate, setToRate] = useState<StockItem[]>([]);
  const [meals, setMeals] = useState<{ text: string | null; message: string | null; loading: boolean }>({
    text: null, message: null, loading: false,
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      call<{ items: StockItem[]; summary: StockSummary }>("/stock"),
      call<Insights>(`/stock/insights?days=${insightDays}`),
    ])
      .then(([stock, ins]) => {
        if (cancelled) return;
        setItems(stock.items);
        setSummary(stock.summary);
        setInsights(ins);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load the inventory"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [version, insightDays]);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  // Runs one action on an item; the backend explains refusals. Then everything is re-read.
  const act = async <T extends StockItem>(path: string, method: "POST" | "PATCH", body?: object): Promise<T | null> => {
    setError(null);
    try {
      const result = await call<T>(path, method, body);
      if (result.finished) {
        setToRate((queue) => (queue.some((i) => i.id === result.id) ? queue : [...queue, result]));
      }
      refresh();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
      return null;
    }
  };

  const useOne = (id: number) => act(`/stock/items/${id}/use`, "POST", { amount: 1 });
  const usedUp = (id: number) => act(`/stock/items/${id}/finish`, "POST");
  const opened = (id: number) => act(`/stock/items/${id}/open`, "POST");
  const freeze = (id: number) => act(`/stock/items/${id}/freeze`, "POST");
  const discard = (id: number, reason: string) => act(`/stock/items/${id}/discard`, "POST", { reason });
  const clearStale = async () => {
    setError(null);
    try {
      await call<{ cleared: number }>("/stock/clear-stale", "POST");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
    }
  };
  const update = (id: number, patch: ItemPatch) => act(`/stock/items/${id}`, "PATCH", patch);

  const rate = async (id: number, patch: ItemPatch) => {
    const updated = await update(id, patch);
    if (updated) setToRate((queue) => queue.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };
  const dismissRating = (id: number) => setToRate((queue) => queue.filter((i) => i.id !== id));

  // Ask Claude what to cook so the things that go off soon get used (costs a few cents).
  const askMeals = async () => {
    setMeals({ text: null, message: null, loading: true });
    try {
      const r = await call<{ ideas: string | null; message: string | null }>("/stock/meal-ideas", "POST");
      setMeals({ text: r.ideas, message: r.message, loading: false });
    } catch (err) {
      setMeals({ text: null, message: err instanceof Error ? err.message : "Could not get ideas", loading: false });
    }
  };

  return {
    items, summary, insights, insightDays, setInsightDays, loading, error,
    useOne, usedUp, opened, freeze, discard, update, clearStale,
    toRate, rate, dismissRating, meals, askMeals,
  };
};
