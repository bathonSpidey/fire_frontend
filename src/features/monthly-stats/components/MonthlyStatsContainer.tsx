import React from "react";
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import { MonthlyStatsDashboard } from "./MonthlyStatsDashboard";
import styles from "../styles/MonthlyStats.module.css";

interface ContainerProps {
  month: string;
  year: number;
}

export const MonthlyStatsContainer: React.FC<ContainerProps> = ({
  month,
  year,
}) => {
  const { stats, previousStats, loading, error } = useMonthlyStats(month, year);

  if (loading) {
    return <div className={styles.loadingMessage}>Updating metrics...</div>;
  }

  if (error) return null; // Fail silently so it doesn't break the main statement view

  return <MonthlyStatsDashboard stats={stats} previousStats={previousStats} />;
};
