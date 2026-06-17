import { useState, useEffect } from 'react';
import type { MonthlyStatsResponse } from '../types';

export const useMonthlyStats = (month: string, year: number) => {
  const [stats, setStats] = useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      const statsUrl = `http://localhost:8000/stats/?month=${month}&year=${year}`;

      try {
        const res = await fetch(statsUrl, { headers: { 'accept': 'application/json' } });
        
        if (res.ok) {
          const data: MonthlyStatsResponse = await res.json();
          setStats(data);
        } else {
          // If a month has no data, it's an empty state rather than a breaking error
          setStats(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [month, year]);

  return { stats, loading, error };
};