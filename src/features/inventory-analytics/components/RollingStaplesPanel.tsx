import React from "react";
import type { RollingStaple } from "../types";
import { formatEuro } from "../lib/formatters";
import styles from "../styles/InventoryAnalytics.module.css";

interface RollingStaplesPanelProps {
  staples: RollingStaple[];
}

const CadenceBar: React.FC<{ days: number; maxDays: number }> = ({
  days,
  maxDays,
}) => {
  const pct = Math.min((days / maxDays) * 100, 100);
  const isFrequent = days <= 14;
  const isMedium = days <= 30;

  const fillClass = isFrequent
    ? styles.cadenceBarFillFrequent
    : isMedium
      ? styles.cadenceBarFillMedium
      : styles.cadenceBarFillSlow;

  return (
    <div className={styles.cadenceBarTrack}>
      <div
        className={`${styles.cadenceBarFill} ${fillClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

export const RollingStaplesPanel: React.FC<RollingStaplesPanelProps> = ({
  staples,
}) => {
  if (staples.length === 0) return null;

  const sorted = [...staples].sort(
    (a, b) => a.purchase_frequency_days - b.purchase_frequency_days,
  );
  const maxDays = Math.max(...sorted.map((s) => s.purchase_frequency_days));

  return (
    <div className={styles.panelCard}>
      <h2 className={styles.panelTitle}>Rolling staples cadence</h2>
      <p className={styles.panelSubtitle}>
        Items sorted by restock frequency — shorter bar means more frequent
      </p>
      <div className={styles.staplesList}>
        {sorted.map((staple, i) => (
          <div key={i} className={styles.stapleRow}>
            <div className={styles.stapleRowHeader}>
              <span className={styles.stapleName}>{staple.name}</span>
              <div className={styles.stapleMetaPills}>
                <span className={styles.staplePill}>
                  every {staple.purchase_frequency_days}d
                </span>
                <span className={styles.staplePill}>
                  {staple.total_units_purchased} units
                </span>
                <span className={styles.staplePill}>
                  avg {formatEuro(staple.average_unit_cost_basis)}
                </span>
                <span className={styles.staplePillMuted}>
                  {staple.distribution_weeks}w tracked
                </span>
              </div>
            </div>
            <CadenceBar
              days={staple.purchase_frequency_days}
              maxDays={maxDays}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
