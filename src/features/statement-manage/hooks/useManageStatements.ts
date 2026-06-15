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

  useEffect(() => {
    const fetchStatements = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `http://localhost:8000/statements/manage/filter/month?month=${month}&year=${year}`,
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

  const selectedStatement = statements.find((s) => s.bank === activeBank) || null;

  return {
    month, year, setYear,
    statements, activeBank, setActiveBank,
    selectedStatement, loading, error,
    handlePrev, handleNext
  };
};