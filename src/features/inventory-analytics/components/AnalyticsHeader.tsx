import React from "react";
import styles from "../styles/InventoryAnalytics.module.css";

interface AnalyticsHeaderProps {
  rollingDays: number;
  leakageDays: number;
  onRollingDaysChange: (days: number) => void;
  onLeakageDaysChange: (days: number) => void;
}

const ROLLING_OPTIONS = [30, 90, 180] as const;
const LEAKAGE_OPTIONS = [14, 30, 60] as const;

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  rollingDays,
  leakageDays,
  onRollingDaysChange,
  onLeakageDaysChange,
}) => (
  <div className={styles.dashHeader}>
    <div>
      <h1 className={styles.dashTitle}>Inventory analytics</h1>
      <p className={styles.dashSubtitle}>
        Pacing profiles and defensive capital tracking
      </p>
    </div>
    <div className={styles.filterGroup}>
      <div className={styles.filterItem}>
        <label className={styles.filterLabel} htmlFor="rolling-span">
          Rolling span
        </label>
        <select
          id="rolling-span"
          className={styles.filterSelect}
          value={rollingDays}
          onChange={(e) => onRollingDaysChange(Number(e.target.value))}
        >
          {ROLLING_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d} days
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterItem}>
        <label className={styles.filterLabel} htmlFor="leakage-window">
          Leakage window
        </label>
        <select
          id="leakage-window"
          className={styles.filterSelect}
          value={leakageDays}
          onChange={(e) => onLeakageDaysChange(Number(e.target.value))}
        >
          {LEAKAGE_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d} days
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
