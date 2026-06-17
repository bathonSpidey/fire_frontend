import React from "react";
import type { MonthlyStatsResponse } from "../types";
import styles from "../styles/MonthlyStats.module.css";

interface DashboardProps {
  stats: MonthlyStatsResponse | null;
}

export const MonthlyStatsDashboard: React.FC<DashboardProps> = ({ stats }) => {
  if (!stats) return null;

  const isSavingsPositive = stats.net_savings >= 0;
  const sortedCategories = Object.entries(stats.categories).sort(
    ([, a], [, b]) => b.total - a.total,
  );

  return (
    <div className={styles.container}>
      {/* High Level KPI Grid */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.label}>Gross Income</span>
          <span className={`${styles.value} ${styles.positive}`}>
            {stats.gross_income.toFixed(2)}€
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.label}>Lifestyle Expenses</span>
          <span className={styles.value}>
            {stats.lifestyle_expenses.toFixed(2)}€
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.label}>Net Savings</span>
          <span
            className={`${styles.value} ${isSavingsPositive ? styles.positive : styles.negative}`}
          >
            {isSavingsPositive ? "+" : ""}
            {stats.net_savings.toFixed(2)}€
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.label}>Savings Rate</span>
          <span
            className={`${styles.value} ${isSavingsPositive ? styles.positive : styles.negative}`}
          >
            {stats.savings_rate_pct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Structured Split Breakdown Metrics Layout */}
      <div className={styles.splitView}>
        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Allocation Rules</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Total Invested</span>
            <span className={styles.infoValue}>
              {stats.total_invested.toFixed(2)}€
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Fixed vs Variable Ratio</span>
            <span className={styles.infoValue}>
              {stats.fixed_vs_variable_ratio}
            </span>
          </div>
        </div>

        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Top Categories Breakdown</h3>
          <div className={styles.categoryList}>
            {sortedCategories.slice(0, 4).map(([name, data]) => {
              const isIncomeTag =
                name.includes("INCOME") || name.includes("SALARY");
              return (
                <div key={name} className={styles.categoryItem}>
                  <div className={styles.categoryMeta}>
                    <span style={{ fontWeight: 500 }}>
                      {name.replace("_", " ")}
                    </span>
                    <span className={styles.infoLabel}>
                      {data.total.toFixed(2)}€ (
                      {data.percentage_of_total.toFixed(1)}%)
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${isIncomeTag ? styles.accentFill : ""}`}
                      style={{
                        width: `${Math.min(data.percentage_of_total, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
