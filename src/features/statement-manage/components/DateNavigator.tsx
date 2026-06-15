import React from "react";
import styles from "../styles/StatementManage.module.css";

interface NavigatorProps {
  month: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onYearChange: (year: number) => void;
}

export const DateNavigator: React.FC<NavigatorProps> = ({
  month,
  year,
  onPrev,
  onNext,
  onYearChange,
}) => {
  const availableYears = Array.from(
    { length: 2026 - 2024 + 1 },
    (_, i) => 2024 + i,
  );

  return (
    <div className={styles.navigator}>
      <div className={styles.dateDisplay}>
        <button className={styles.arrowBtn} onClick={onPrev}>
          ←
        </button>
        <span className={styles.monthLabel}>{month}</span>
        <button className={styles.arrowBtn} onClick={onNext}>
          →
        </button>
      </div>

      <select
        className={styles.yearSelect}
        value={year}
        onChange={(e) => onYearChange(Number(e.target.value))}
      >
        {availableYears.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
};
