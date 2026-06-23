import React from "react";
import type { RegularEssential } from "../types";
import { formatDays, formatCategoryLabel } from "../lib/formatters";
import styles from "../styles/InventoryAnalytics.module.css";

interface EssentialsTableProps {
  essentials: RegularEssential[];
}

const EssentialRow: React.FC<{ essential: RegularEssential }> = ({
  essential,
}) => (
  <tr className={styles.tableRow}>
    <td className={styles.tdBold}>{essential.name}</td>
    <td className={styles.tdMuted}>
      {essential.brand !== "Generic" ? essential.brand : "—"}
    </td>
    <td>
      <span className={styles.categoryPill}>
        {formatCategoryLabel(essential.category)}
      </span>
    </td>
    <td className={styles.tdMuted}>{essential.storage_condition}</td>
    <td className={styles.tdMuted}>
      {formatDays(essential.average_restock_interval_days)}
    </td>
    <td>
      <span className={styles.pacingPill}>
        {essential.consumption_pacing_profile}
      </span>
    </td>
    <td className={styles.tdMuted}>{essential.historical_span_days}d</td>
  </tr>
);

export const EssentialsTable: React.FC<EssentialsTableProps> = ({
  essentials,
}) => {
  if (essentials.length === 0) {
    return <div className={styles.panelEmpty}>No essentials tracked yet</div>;
  }

  return (
    <div className={styles.panelCard}>
      <h2 className={styles.panelTitle}>Regularly managed essentials</h2>
      <p className={styles.panelSubtitle}>
        Velocity profiles and pacing history
      </p>
      <div className={styles.tableResponsive}>
        <table className={styles.analyticsTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Storage</th>
              <th>Avg restock</th>
              <th>Velocity profile</th>
              <th>Span</th>
            </tr>
          </thead>
          <tbody>
            {essentials.map((e, i) => (
              <EssentialRow key={i} essential={e} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
