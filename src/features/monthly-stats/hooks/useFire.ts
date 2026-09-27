import { useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { FireSummary } from "../types";

async function call<T>(path: string, method: "GET" | "PUT" | "POST" | "PATCH" | "DELETE" = "GET", body?: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(typeof detail?.detail === "string" ? detail.detail : `Request failed (status ${res.status})`);
  }
  return res.json();
}

/** The FIRE number and everything that can change it. Re-fetches after every action, and whenever
 * the shared refreshKey changes (e.g. a new statement was uploaded), so nothing shows a stale total. */
export const useFire = (refreshKey = 0) => {
  const [data, setData] = useState<FireSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let current = true;
    call<FireSummary>("/fire")
      .then((json) => {
        if (!current) return;
        setData(json);
        setError(null);
      })
      .catch((err) => current && setError(err instanceof Error ? err.message : "Could not load the FIRE number"))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [refreshKey, version]);

  const run = async (action: () => Promise<FireSummary>): Promise<boolean> => {
    setError(null);
    try {
      setData(await action());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
      return false;
    }
  };

  return {
    data, loading, error,
    reload: () => setVersion((v) => v + 1),
    setTarget: (target_monthly_spend: number, withdrawal_rate: number) =>
      run(() => call<FireSummary>("/fire/settings", "PUT", { target_monthly_spend, withdrawal_rate })),
    addAdjustment: (label: string, amount: number, note?: string) =>
      run(() => call<FireSummary>("/fire/adjustments", "POST", { label, amount, note })),
    updateAdjustment: (id: number, changes: { label?: string; amount?: number; note?: string }) =>
      run(() => call<FireSummary>(`/fire/adjustments/${id}`, "PATCH", changes)),
    deleteAdjustment: (id: number) => run(() => call<FireSummary>(`/fire/adjustments/${id}`, "DELETE")),
  };
};
