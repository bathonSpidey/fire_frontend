import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { Frequency, Plan, PlanInput, PlansResponse } from "../types";

async function call<T>(path: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET", body?: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    const message = typeof detail?.detail === "string" ? detail.detail : `Request failed (status ${res.status})`;
    throw new Error(message);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

// The savings plans, and every action on them. The server answers refusals in words; after each
// action the whole list is read again so the totals and dates on the page always agree.
export const usePlans = () => {
  const [data, setData] = useState<PlansResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    call<PlansResponse>("/investments/plans")
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Could not load the plans"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [version]);

  const run = useCallback(async (action: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    try {
      await action();
      setVersion((v) => v + 1);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "That did not work");
      return false;
    }
  }, []);

  return {
    data, loading, error,
    create: (input: PlanInput) => run(() => call<Plan>("/investments/plans", "POST", input)),
    correct: (id: number, changes: Partial<Omit<PlanInput, "broker">>) =>
      run(() => call<Plan>(`/investments/plans/${id}`, "PATCH", changes)),
    suspend: (id: number, on: string | null) => run(() => call<Plan>(`/investments/plans/${id}/suspend`, "POST", { on })),
    resume: (id: number, on: string | null) => run(() => call<Plan>(`/investments/plans/${id}/resume`, "POST", { on })),
    change: (id: number, change: { from_date: string; amount?: number; frequency?: Frequency; instrument?: string }) =>
      run(() => call<Plan>(`/investments/plans/${id}/change`, "POST", change)),
    remove: (id: number) => run(() => call<void>(`/investments/plans/${id}`, "DELETE")),
  };
};
