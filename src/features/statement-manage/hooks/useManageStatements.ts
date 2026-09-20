import { API_BASE } from "../../../core/api";
import { useState, useEffect } from 'react';
import type { BankStatementResponse } from '../../statement-upload/types';
import type { MonthlyReceiptInventory } from '../../../shared/types/receipts';
import { MONTHS, clampToNow, getInitialPeriod, getNextMonthPeriod, getPrevMonthPeriod, isLatestPeriod } from '../utils/dateUtils';

export const useManageStatements = () => {
  const initial = getInitialPeriod();
  const [month, setMonth] = useState<string>(initial.month);
  const [year, setYear] = useState<number>(initial.year);
  const [statements, setStatements] = useState<BankStatementResponse[]>([]);
  const [activeBank, setActiveBank] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<MonthlyReceiptInventory[]>([]);
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

  const canGoNext = !isLatestPeriod(month, year);

  const handleNext = () => {
    if (!canGoNext) return;
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

  // Picking a year must not jump past the current month.
  const changeYear = (newYear: number) => {
    const clamped = clampToNow(month, newYear);
    setYear(clamped.year);
    setMonth(clamped.month);
  };

  // The month's receipts, shown next to the bank tabs (the same data the Inventory page uses).
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/inventory-management/receipts/month?year=${year}&month=${MONTHS.indexOf(month) + 1}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((list: MonthlyReceiptInventory[]) => !cancelled && setReceipts(list))
      .catch(() => !cancelled && setReceipts([]));
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  // Change the category of one receipt item; the month numbers refresh afterwards.
  const changeItemCategory = async (itemId: number, receiptId: number, category: string) => {
    setSaveError(null);
    try {
      const res = await fetch(`${API_BASE}/entries/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Could not save (status ${res.status})`);
      }
      setReceipts((all) =>
        all.map((rec) =>
          rec.id !== receiptId
            ? rec
            : { ...rec, items: rec.items.map((i) => (i.id === itemId ? { ...i, spend_category: category } : i)) },
        ),
      );
      setStatsVersion((v) => v + 1);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the category");
    }
  };

  const selectedStatement = statements.find((s) => s.bank === activeBank) || null;

  return {
    month, year, setYear: changeYear, canGoNext,
    receipts, changeItemCategory,
    statements, activeBank, setActiveBank,
    selectedStatement, loading, error,
    saveError, statsVersion, changeCategory,
    handlePrev, handleNext
  };
};