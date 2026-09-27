import { useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import type { NetWorthResponse } from "../types";

/** What the household has right now: not month-scoped, so it does not change with the date navigator. */
export const useNetWorth = (refreshKey = 0) => {
  const [data, setData] = useState<NetWorthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let current = true;
    fetch(`${API_BASE}/net-worth`, { headers: { accept: "application/json" } })
      .then((res) => (res.ok ? (res.json() as Promise<NetWorthResponse>) : null))
      .then((json) => current && setData(json))
      .catch(() => current && setData(null))
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [refreshKey]);

  return { data, loading };
};
