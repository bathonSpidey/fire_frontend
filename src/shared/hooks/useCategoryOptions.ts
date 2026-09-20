import { useEffect, useState } from "react";
import { API_BASE } from "../../core/api";

export interface CategoryOption {
  key: string;
  label: string;
  group_name: string;
  flow: "expense" | "income";
  active: boolean;
}

// Every row on a page shows this dropdown, so share one request between them. The list is
// refreshed after a short time so edits made on the Categories page show up here.
const CACHE_MS = 30_000;
let cached: { at: number; promise: Promise<CategoryOption[]> } | null = null;

const loadOptions = (): Promise<CategoryOption[]> => {
  if (!cached || Date.now() - cached.at > CACHE_MS) {
    const promise = fetch(`${API_BASE}/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: CategoryOption[]) => list.filter((c) => c.active))
      .catch(() => [] as CategoryOption[]);
    cached = { at: Date.now(), promise };
  }
  return cached.promise;
};

export const useCategoryOptions = () => {
  const [options, setOptions] = useState<CategoryOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadOptions().then((list) => {
      if (!cancelled) setOptions(list);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const byKey = new Map(options.map((c) => [c.key, c]));
  return { options, byKey };
};
