import React from "react";
import type { NamedCategoryStat } from "../lib/categoryGrouping";
import { formatCategoryLabel } from "../lib/categoryGrouping";
import { formatEuro, formatPercent } from "../lib/statsCalculation";
import styles from "../styles/MonthlyStats.module.css";

interface CategoryBreakdownListProps {
  categories: NamedCategoryStat[];
  accentVariant?: "default" | "income";
  maxItems?: number;
}

export const CategoryBreakdownList: React.FC<CategoryBreakdownListProps> = ({
  categories,
  accentVariant = "default",
  maxItems = 4,
}) => {
  const visibleCategories = categories.slice(0, maxItems);

  if (visibleCategories.length === 0) {
    return <p className={styles.emptyListMessage}>No categories to show</p>;
  }

  const barFillClass =
    accentVariant === "income" ? styles.accentFillIncome : styles.barFill;

  return (
    <div className={styles.categoryList}>
      {visibleCategories.map((category) => (
        <div key={category.name} className={styles.categoryItem}>
          <div className={styles.categoryMeta}>
            <span className={styles.categoryName}>
              {formatCategoryLabel(category.name)}
            </span>
            <span className={styles.infoLabel}>
              {formatEuro(category.total)} (
              {formatPercent(category.percentage_of_total)})
            </span>
          </div>
          <div className={styles.barTrack}>
            <div
              className={barFillClass}
              style={{
                width: `${Math.min(category.percentage_of_total, 100)}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
