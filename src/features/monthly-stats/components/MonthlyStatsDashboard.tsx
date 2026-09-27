import React from "react";
import type { MonthlyStatsResponse, NetWorthResponse } from "../types";
import {
  calculateTrend,
  formatEuro,
  formatPercent,
} from "../lib/statsCalculation";
import { groupCategoriesByType } from "../lib/categoryGrouping";
import { useNetWorth } from "../hooks/useNetWorth";
import { FireCard } from "./FireCard";
import { TrendIndicator } from "./TrendIndicator";
import { CategoryDonutChart } from "./CategoryDonutChart";
import { CategoryBreakdownList } from "./CategoryBreakdownList";
import styles from "../styles/MonthlyStats.module.css";

const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

// A short explanation under a number, so nobody has to guess what it includes.
const Hint: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontSize: "0.75rem", lineHeight: 1.4, color: "var(--text-secondary)", marginTop: "4px" }}>
    {children}
  </span>
);

// One line saying what the month is built from, and what is still missing (nothing is hidden).
const SourceNote: React.FC<{ stats: MonthlyStatsResponse }> = ({ stats }) => {
  const sources = stats.sources;
  if (!sources) return null;
  const euro = (value: number) => `${value.toFixed(2)} €`;
  const receipts = `${sources.receipts} receipt${sources.receipts === 1 ? "" : "s"}`;
  const hasRealBank = sources.statements.some((bank) => bank !== "PayPal");
  const parts = [
    sources.statements.length > 0 ? `${sources.statements.join(", ")} statement` : null,
    sources.receipts > 0 ? receipts : null,
  ].filter(Boolean);
  return (
    <div
      role="note"
      style={{
        padding: "0.75rem 1rem",
        borderRadius: "var(--radius-lg)",
        border: `0.5px solid ${hasRealBank ? "var(--border)" : "var(--warning-border)"}`,
        background: hasRealBank ? "transparent" : "var(--warning-subtle)",
        fontSize: "0.875rem",
        lineHeight: 1.5,
      }}
    >
      Based on {parts.join(" and ")}.
      {sources.receipts > 0 && sources.receipt_total !== undefined && (
        <>
          {" "}
          Spending {euro(stats.lifestyle_expenses)} = {euro(sources.receipt_total)} from the receipts +{" "}
          {euro(sources.bank_only_total ?? 0)} paid without a receipt (bank or PayPal).
        </>
      )}
      {!hasRealBank &&
        " No bank account statement for this month yet: income, investments and fixed costs such as rent appear when it is uploaded."}
    </div>
  );
};

// What the household has right now: cash per account plus invested at cost. Not month-scoped, so it
// does not change when the date navigator moves — only when a newer statement is uploaded.
const NetWorthCard: React.FC<{ netWorth: NetWorthResponse }> = ({ netWorth }) => {
  const known = netWorth.accounts.filter((a) => a.balance !== null);
  return (
    <div className={styles.kpiCard}>
      <span className={styles.label}>Net worth</span>
      <span className={`${styles.value} ${styles.positive}`}>{formatEuro(netWorth.net_worth)}</span>
      <Hint>
        {known.map((a) => `${a.bank} ${formatEuro(a.balance ?? 0)}`).join(" + ")}
        {known.length > 0 ? " + " : ""}
        {formatEuro(netWorth.invested)} invested (at cost, not market value).
        {netWorth.oldest_balance &&
          ` Accounts as of ${shortDate(netWorth.oldest_balance)}${netWorth.any_stale ? " — one or more overdue for a new statement." : "."}`}
      </Hint>
    </div>
  );
};

const NetWorthDetail: React.FC<{ netWorth: NetWorthResponse }> = ({ netWorth }) => (
  <div className={styles.metaCard}>
    <h3 className={styles.sectionTitle}>Net worth by account</h3>
    {netWorth.accounts.map((a) => (
      <div className={styles.infoRow} key={a.bank}>
        <span className={styles.infoLabel}>
          {a.bank}
          {a.as_of && (
            <span style={{ color: a.stale ? "var(--warning-text)" : "var(--text-secondary)" }}>
              {" "}
              (as of {shortDate(a.as_of)})
            </span>
          )}
        </span>
        <span className={styles.infoValue}>{a.balance === null ? "No statement yet" : formatEuro(a.balance)}</span>
      </div>
    ))}
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>Invested (cost)</span>
      <span className={styles.infoValue}>{formatEuro(netWorth.invested)}</span>
    </div>
  </div>
);

interface DashboardProps {
  stats: MonthlyStatsResponse | null;
  previousStats: MonthlyStatsResponse | null;
  refreshKey?: number;
}

export const MonthlyStatsDashboard: React.FC<DashboardProps> = ({
  stats,
  previousStats,
  refreshKey,
}) => {
  const { data: netWorth } = useNetWorth(refreshKey);

  if (!stats) return null;

  const isSavingsPositive = stats.net_savings >= 0;
  const isInvestingPositive = stats.total_invested >= 0;
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
  const investedTrend = previousStats
    ? calculateTrend(stats.total_invested, previousStats.total_invested)
    : null;

  return (
    <div className={styles.container}>
      <FireCard refreshKey={refreshKey} />
      <SourceNote stats={stats} />
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.label}>Gross income</span>
          <span className={`${styles.value} ${styles.positive}`}>
            {formatEuro(stats.gross_income)}
          </span>
          {incomeTrend && <TrendIndicator trend={incomeTrend} />}
          <Hint>Money that arrived: salary, refunds, money from friends. Moves between your own accounts do not count.</Hint>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Lifestyle expenses</span>
          <span className={styles.value}>
            {formatEuro(stats.lifestyle_expenses)}
          </span>
          {expenseTrend && <TrendIndicator trend={expenseTrend} invertColor />}
          <Hint>Everything spent on living this month: receipts plus payments made without a receipt. Not transfers or investments.</Hint>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Net savings</span>
          <span
            className={`${styles.value} ${isSavingsPositive ? styles.positive : styles.negative}`}
          >
            {formatEuro(stats.net_savings, true)}
          </span>
          {savingsTrend && <TrendIndicator trend={savingsTrend} />}
          <Hint>Gross income minus lifestyle expenses.</Hint>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Savings rate</span>
          <span
            className={`${styles.value} ${isSavingsPositive ? styles.positive : styles.negative}`}
          >
            {formatPercent(stats.savings_rate_pct)}
          </span>
          {savingsRateTrend && <TrendIndicator trend={savingsRateTrend} />}
          <Hint>Net savings as a share of gross income.</Hint>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.label}>Net invested</span>
          <span className={`${styles.value} ${isInvestingPositive ? styles.positive : styles.negative}`}>
            {formatEuro(stats.total_invested)}
          </span>
          {investedTrend && <TrendIndicator trend={investedTrend} />}
          <Hint>Money moved into investments this month, net of anything sold back. This is saving too — it just is not sitting in cash.</Hint>
        </div>

        {netWorth && <NetWorthCard netWorth={netWorth} />}
      </div>

      <div className={styles.splitView}>
        <div className={styles.metaCard}>
          <h3 className={styles.sectionTitle}>Spend distribution</h3>
          <CategoryDonutChart categories={expense} />
        </div>

        {netWorth ? (
          <NetWorthDetail netWorth={netWorth} />
        ) : (
          <div className={styles.metaCard}>
            <h3 className={styles.sectionTitle}>Net worth by account</h3>
            <Hint>Loading...</Hint>
          </div>
        )}
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
