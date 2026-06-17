import React from "react";
import { useMonthlyStats } from "../hooks/useMonthlyStats";
import { MonthlyStatsDashboard } from "./MonthlyStatsDashboard";

interface ContainerProps {
  month: string;
  year: number;
}

export const MonthlyStatsContainer: React.FC<ContainerProps> = ({
  month,
  year,
}) => {
  const { stats, loading, error } = useMonthlyStats(month, year);

  if (loading)
    return (
      <div
        style={{
          fontSize: "0.875rem",
          color: "var(--text-secondary)",
          padding: "12px 0",
        }}
      >
        Updating metrics...
      </div>
    );
  if (error) return null; // Fail silently so it doesn't break the main statement view

  return <MonthlyStatsDashboard stats={stats} />;
};
