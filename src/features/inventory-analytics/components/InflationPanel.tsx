import React from "react";
import type { InflationAlert } from "../types";
import { formatEuro, formatPlusMinus } from "../lib/formatters";
import styles from "../styles/InventoryAnalytics.module.css";

interface InflationPanelProps {
  alerts: InflationAlert[];
}

const InflationItem: React.FC<{ alert: InflationAlert }> = ({ alert }) => {
  const isSevere = alert.percentage_inflation_drift > 40;
  const isHigh = alert.percentage_inflation_drift > 20;

  const badgeClass = isSevere
    ? styles.inflationBadgeSevere
    : isHigh
      ? styles.inflationBadgeHigh
      : styles.inflationBadgeNormal;

  return (
    <div className={styles.listItem}>
      <div className={styles.listItemBody}>
        <div className={styles.itemNameBold}>{alert.item_name}</div>
        <div className={styles.itemMetaSub}>
          Base {formatEuro(alert.historical_base_price)} → Latest{" "}
          {formatEuro(alert.latest_market_price)}
          <span className={styles.inflationDateRange}>
            {alert.first_tracked_date} – {alert.latest_tracked_date}
          </span>
        </div>
      </div>
      <span className={`${styles.inflationBadge} ${badgeClass}`}>
        {formatPlusMinus(alert.percentage_inflation_drift)}
      </span>
    </div>
  );
};

export const InflationPanel: React.FC<InflationPanelProps> = ({ alerts }) => {
  const sorted = [...alerts].sort(
    (a, b) => b.percentage_inflation_drift - a.percentage_inflation_drift,
  );

  return (
    <div className={styles.panelCard}>
      <h2 className={styles.panelTitle}>Price & inflation surges</h2>
      <p className={styles.panelSubtitle}>Sorted by highest drift</p>
      {sorted.length === 0 ? (
        <div className={styles.panelEmpty}>No inflation alerts</div>
      ) : (
        <div className={styles.scrollList}>
          {sorted.map((alert, i) => (
            <InflationItem key={i} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
};
