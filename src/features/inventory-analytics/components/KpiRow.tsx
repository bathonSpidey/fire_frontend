import React from "react";
import styles from "../styles/InventoryAnalytics.module.css";
import { formatEuro } from "../lib/formatters";
import type { InventoryAnalyticsPayload } from "../types";

interface KpiRowProps {
  data: InventoryAnalyticsPayload;
}

export const KpiRow: React.FC<KpiRowProps> = ({ data }) => {
  const {
    financial_leakage,
    predicted_pantry_deficits,
    price_inflation_alerts,
  } = data;

  const criticalDeficits = predicted_pantry_deficits.filter(
    (d) => d.urgency === "CRITICAL",
  ).length;

  const highInflationCount = price_inflation_alerts.filter(
    (a) => a.percentage_inflation_drift > 20,
  ).length;

  const hasLeakage = financial_leakage.total_capital_wasted > 0;
  const hasAlerts = highInflationCount > 0;

  return (
    <div className={styles.kpiGrid}>
      <div
        className={`${styles.kpiCard} ${hasLeakage ? styles.kpiDanger : ""}`}
      >
        <span className={styles.kpiLabel}>
          Capital wasted ({financial_leakage.rolling_evaluation_days}d)
        </span>
        <span
          className={`${styles.kpiValue} ${hasLeakage ? styles.kpiValueDanger : ""}`}
        >
          {formatEuro(financial_leakage.total_capital_wasted)}
        </span>
      </div>

      <div
        className={`${styles.kpiCard} ${criticalDeficits > 0 ? styles.kpiWarning : ""}`}
      >
        <span className={styles.kpiLabel}>Pantry deficits</span>
        <span
          className={`${styles.kpiValue} ${criticalDeficits > 0 ? styles.kpiValueWarning : ""}`}
        >
          {criticalDeficits} critical
        </span>
      </div>

      <div
        className={`${styles.kpiCard} ${hasAlerts ? styles.kpiWarning : ""}`}
      >
        <span className={styles.kpiLabel}>High inflation items (&gt;20%)</span>
        <span
          className={`${styles.kpiValue} ${hasAlerts ? styles.kpiValueWarning : ""}`}
        >
          {highInflationCount} products
        </span>
      </div>
    </div>
  );
};
