import React from "react";
import type { MonthlyReceiptInventory } from "../types";
import styles from "../styles/MonthlyInventory.module.css";

interface StatsProps {
  receipts: MonthlyReceiptInventory[];
}

export const InventoryStats: React.FC<StatsProps> = ({ receipts }) => {
  const totalSpent = receipts.reduce((sum, r) => sum + r.total_amount, 0);
  const totalDiscount = receipts.reduce((sum, r) => sum + r.total_discount, 0);
  const totalItemsCount = receipts.reduce(
    (sum, r) => sum + r.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0,
  );

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Total spent</span>
        <span className={styles.statValue}>{totalSpent.toFixed(2)} €</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Items ingested</span>
        <span className={styles.statValue}>{totalItemsCount} units</span>
      </div>
      <div className={styles.statCard}>
        <span className={styles.statLabel}>Discounts saved</span>
        <span className={`${styles.statValue} ${styles.statValueSuccess}`}>
          {totalDiscount.toFixed(2)} €
        </span>
      </div>
    </div>
  );
};
