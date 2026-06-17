import React from "react";
import type { TrendDelta } from "../lib/statsCalculation";
import { formatPercent } from "../lib/statsCalculation";
import styles from "../styles/MonthlyStats.module.css";

interface TrendIndicatorProps {
  trend: TrendDelta;
  /** When true, an upward trend is colored as bad (e.g. for expenses) */
  invertColor?: boolean;
}

const ArrowUp: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const ArrowDown: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  trend,
  invertColor = false,
}) => {
  if (trend.direction === "flat" || trend.percentChange === null) {
    return (
      <span className={`${styles.trendBadge} ${styles.trendFlat}`}>
        No change
      </span>
    );
  }

  const isGoodTrend = invertColor
    ? trend.direction === "down"
    : trend.direction === "up";

  const colorClass = isGoodTrend ? styles.trendPositive : styles.trendNegative;

  return (
    <span className={`${styles.trendBadge} ${colorClass}`}>
      {trend.direction === "up" ? <ArrowUp /> : <ArrowDown />}
      {formatPercent(Math.abs(trend.percentChange))}
      <span className={styles.trendCaption}>vs last month</span>
    </span>
  );
};
