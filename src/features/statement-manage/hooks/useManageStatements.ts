import { API_BASE } from "../../../core/api";
import { useState, useEffect } from 'react';
import type { BankStatementResponse } from '../../statement-upload/types';
import { getInitialPeriod, getNextMonthPeriod, getPrevMonthPeriod } from '../utils/dateUtils';

export const useManageStatements = () => {
  const initial = getInitialPeriod();
  const [month, setMonth] = useState<string>(initial.month);
  const [year, setYear] = useState<number>(initial.year);
  const [statements, setStatements] = useState<BankStatementResponse[]>([]);
  const [activeBank, setActiveBank] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statsVersion, setStatsVersion] = useState(0); // bumps when a change affects the month numbers

  useEffect(() => {
    const fetchStatements = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${API_BASE}/statements/manage/filter/month?month=${month}&year=${year}`,
          { headers: { 'accept': 'application/json' } }
        );
        if (!res.ok) throw new Error(`Error loading data: ${res.status}`);
        const data: BankStatementResponse[] = await res.json();
        
        setStatements(data);
        // Default to first active bank if present
        setActiveBank(data.length > 0 ? data[0].bank : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown network error');
        setStatements([]);
        setActiveBank(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatements();
  }, [month, year]);

  const handlePrev = () => {
    const prev = getPrevMonthPeriod(month, year);
    setMonth(prev.month);
    setYear(prev.year);
  };

  const handleNext = () => {
    const next = getNextMonthPeriod(month, year);
    setMonth(next.month);
    setYear(next.year);
  };

  // Change one booking's category; the backend refuses unsuitable ones with a reason.
  const changeCategory = async (txId: number, category: string) => {
    setSaveError(null);
    try {
      const res = await fetch(`${API_BASE}/entries/transactions/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Could not save (status ${res.status})`);
      }
      setStatements((all) =>
        all.map((st) => ({
          ...st,
          transactions: st.transactions.map((tx) => (tx.id === txId ? { ...tx, category } : tx)),
        })),
      );
      setStatsVersion((v) => v + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the category");
    }
  };

  const selectedStatement = statements.find((s) => s.bank === activeBank) || null;

  return {
    month, year, setYear,
    statements, activeBank, setActiveBank,
    selectedStatement, loading, error,
    saveError, statsVersion, changeCategory,
    handlePrev, handleNext
  };
};