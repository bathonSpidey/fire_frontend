import { useState, useEffect } from "react";
import type { InventoryAnalyticsPayload } from "../types";

export const useInventoryAnalytics = (initialRollingDays = 90, initialLeakageDays = 30) => {
  const [data, setData] = useState<InventoryAnalyticsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rollingDays, setRollingDays] = useState<number>(initialRollingDays);
  const [leakageDays, setLeakageDays] = useState<number>(initialLeakageDays);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `http://localhost:8000/inventory-analytics/dashboard?rolling_days=${rollingDays}&leakage_days=${leakageDays}`;
        const res = await fetch(url, { headers: { accept: "application/json" } });
        
        if (!res.ok) throw new Error(`Analytics server returned status: ${res.status}`);
        
        const json: InventoryAnalyticsPayload = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory analytics");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [rollingDays, leakageDays]); // Automatic updates whenever these shift

  return {
    data,
    loading,
    error,
    rollingDays,
    leakageDays,
    setRollingDays,
    setLeakageDays,
  };
};