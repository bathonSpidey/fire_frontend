import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";

export interface Category {
  key: string;
  label: string;
  group_name: string;
  flow: "expense" | "income";
  fixed: boolean;
  description: string | null;
  sort_order: number;
  active: boolean;
  items: number;
  transactions: number;
}

export interface NewCategory {
  label: string;
  group_name: string;
  flow: "expense" | "income";
  description: string;
  fixed: boolean;
}

export interface RecheckScope {
  from_categories: string[] | null; // null = every entry; [] = only entries without a category
  include_uncategorized: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.detail ?? `Request failed (status ${res.status})`);
  }
  return res.json();
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uncategorized, setUncategorized] = useState({ items: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      request<Category[]>("/categories"),
      request<{ items: number; transactions: number }>("/categories/uncategorized"),
    ])
      .then(([list, uncat]) => {
        if (cancelled) return;
        setCategories(list);
        setUncategorized(uncat);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  // Runs an action, shows its outcome, and refreshes the list.
  const act = async (action: () => Promise<string | void>) => {
    setError(null);
    setMessage(null);
    try {
      const done = await action();
      if (done) setMessage(done);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    reload();
  };

  const create = (body: NewCategory) =>
    act(async () => {
      await request("/categories", { method: "POST", body: JSON.stringify(body) });
      return `Added "${body.label}". New uploads use it right away; use the re-check below to move existing entries.`;
    });

  const update = (key: string, patch: Partial<Category>) =>
    act(async () => {
      await request(`/categories/${key}`, { method: "PATCH", body: JSON.stringify(patch) });
    });

  const merge = (key: string, into: string) =>
    act(async () => {
      const r = await request<{ moved_items: number; moved_transactions: number }>(
        `/categories/${key}/merge`, { method: "POST", body: JSON.stringify({ into }) },
      );
      return `Merged: moved ${r.moved_items} items and ${r.moved_transactions} bookings.`;
    });

  const remove = (key: string) =>
    act(async () => {
      const r = await request<{ uncategorized_items: number; uncategorized_transactions: number }>(
        `/categories/${key}`, { method: "DELETE" },
      );
      return `Deleted. ${r.uncategorized_items} items and ${r.uncategorized_transactions} bookings are now uncategorized - use the re-check to file them again.`;
    });

  const previewRecheck = (scope: RecheckScope) =>
    request<{ entries: number; batches: number }>("/categories/recheck", {
      method: "POST",
      body: JSON.stringify({ ...scope, dry_run: true }),
    });

  const recheck = (scope: RecheckScope) =>
    act(async () => {
      const r = await request<{ entries: number; job_id: number | null }>("/categories/recheck", {
        method: "POST",
        body: JSON.stringify({ ...scope, dry_run: false }),
      });
      return r.job_id
        ? `Claude is re-checking ${r.entries} entries in the background. Progress shows on the Upload page.`
        : "Nothing to re-check.";
    });

  return {
    categories, uncategorized, loading, error, message,
    create, update, merge, remove, previewRecheck, recheck,
  };
};
