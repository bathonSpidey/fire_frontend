import { useState, useEffect } from "react";
import type { MonthlyReceiptInventory } from "../types";

export const useMonthlyInventory = () => {
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getMonth() + 1); // 1-12 range
  const [year, setYear] = useState<number>(now.getFullYear());
  const [receipts, setReceipts] = useState<MonthlyReceiptInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      setError(null);
      const url = `http://localhost:8000/inventory-management/receipts/month?year=${year}&month=${month}`;

      try {
        const res = await fetch(url, { headers: { accept: "application/json" } });
        if (!res.ok) throw new Error(`Inventory server returned status: ${res.status}`);
        
        const data: MonthlyReceiptInventory[] = await res.json();
        setReceipts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inventory records");
        setReceipts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [month, year]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  };

  return {
    month,
    year,
    setYear,
    receipts,
    loading,
    error,
    handlePrevMonth,
    handleNextMonth,
  };
};