import React from "react";
import type { MonthlyStatsResponse } from "../types";
import {
  calculateTrend,
  formatEuro,
  formatPercent,
} from "../lib/statsCalculation";
import { groupCategoriesByType } from "../lib/categoryGrouping";
import { TrendIndicator } from "./TrendIndicator";
import { CategoryDonutChart } from "./CategoryDonutChart";
import { CategoryBreakdownList } from "./CategoryBreakdownList";
import styles from "../styles/MonthlyStats.module.css";

interface DashboardProps {
  stats: MonthlyStatsResponse | null;
  previousStats: MonthlyStatsResponse | null;
}

export const MonthlyStatsDashboard: React.FC<DashboardProps> = ({
  stats,
  previousStats,
}) => {
  if (!stats) return null;

  const isSavingsPositive = stats.net_savings >= 0;
  const { income, expense } = groupCategoriesByType(stats.categories);

  const incomeTrend = previousStats
    ? calculateTrend(stats.gross_income, previousStats.gross_income)
    : null;
  const expenseTrend = previousStats
    ? calculateTrend(stats.lifestyle_expenses, previousStats.lifestyle_expenses)
    : null;
  const savingsTrend = previousStats
    ? calculateTrend(stats.net_savings, previousStats.net_savings)
    : null;
  const savingsRateTrend = previousStats
    ? calculateTrend(stats.savings_rate_pct, previousStats.savings_rate_pct)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.label}>Gross income</span>
          <span className={`${styles.value} ${styles.positive}`}>
            {formatEuro(stats.gross_income)}
          </span>
          {incomeTrend && <TrendIndicator trend={incomeTrend} />}
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Lifestyle expenses</span>
          <span className={styles.value}>
            {formatEuro(stats.lifestyle_expenses)}
          </span>
          {expenseTrend && <TrendIndicator trend={expenseTrend} invertColor />}
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Net savings</span>
          <span
            className={`${styles.value} ${isSavingsPositive ? styles.positive : styles.negative}`}
          >
            {formatEuro(stats.net_savings, true)}
          </span>
          {savingsTrend && <TrendIndicator trend={savingsTrend} />}
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Savings rate</span>
          <span
            className={`${styles.value} ${isSavingsPositive ? styles.positive : styles.negative}`}
          >
            {formatPercent(stats.savings_rate_pct)}
          </span>
          {savingsRateTrend && <TrendIndicator trend={savingsRateTrend} />}
        </div>
      </div>

      <div className={styles.splitView}>
        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Spend distribution</h3>
          <CategoryDonutChart categories={expense} />
        </div>

        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Allocation rules</h3>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Total invested</span>
            <span className={styles.infoValue}>
              {formatEuro(stats.total_invested)}
            </span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Fixed vs variable ratio</span>
            <span className={styles.infoValue}>
              {stats.fixed_vs_variable_ratio}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.splitView}>
        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Top expense categories</h3>
          <CategoryBreakdownList categories={expense} />
        </div>

        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Income sources</h3>
          <CategoryBreakdownList categories={income} accentVariant="income" />
        </div>
      </div>
    </div>
  );
};
