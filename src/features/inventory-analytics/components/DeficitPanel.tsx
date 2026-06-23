import React from "react";
import type { PredictedDeficit } from "../types";
import { URGENCY_CONFIG, sortByUrgency } from "../lib/urgencyConfig";
import styles from "../styles/InventoryAnalytics.module.css";

interface DeficitPanelProps {
  deficits: PredictedDeficit[];
}

const DeficitItem: React.FC<{ deficit: PredictedDeficit }> = ({ deficit }) => {
  const config = URGENCY_CONFIG[deficit.urgency];
  const triggerLabel = deficit.deficit_trigger.replace(/_/g, " ");

  return (
    <div
      className={`${styles.listItem} ${styles[`urgency${config.cssModifier}`]}`}
    >
      <div className={styles.listItemBody}>
        <div className={styles.itemNameBold}>{deficit.name}</div>
        <div className={styles.itemMetaSub}>
          {triggerLabel} · Last: {deficit.last_action_state}
          {deficit.last_purchased_date && (
            <> · Bought {deficit.last_purchased_date}</>
          )}
        </div>
      </div>
      <span
        className={`${styles.urgencyBadge} ${styles[`urgencyBadge${config.cssModifier}`]}`}
      >
        {config.label}
      </span>
    </div>
  );
};

export const DeficitPanel: React.FC<DeficitPanelProps> = ({ deficits }) => {
  const sorted = sortByUrgency(deficits);

  return (
    <div className={styles.panelCard}>
      <h2 className={styles.panelTitle}>Restock shortfalls</h2>
      <p className={styles.panelSubtitle}>Auto-generated shopping list</p>
      {sorted.length === 0 ? (
        <div className={styles.panelEmpty}>No deficits detected</div>
      ) : (
        <div className={styles.scrollList}>
          {sorted.map((deficit, i) => (
            <DeficitItem key={i} deficit={deficit} />
          ))}
        </div>
      )}
    </div>
  );
};
