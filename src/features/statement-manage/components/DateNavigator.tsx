import React from "react";
import styles from "../styles/StatementManage.module.css";

interface NavigatorProps {
  month: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  onYearChange: (year: number) => void;
}

const ChevronLeft: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const AVAILABLE_YEARS = Array.from(
  { length: 2026 - 2024 + 1 },
  (_, i) => 2024 + i,
);

export const DateNavigator: React.FC<NavigatorProps> = ({
  month,
  year,
  onPrev,
  onNext,
  onYearChange,
}) => (
  <div className={styles.navigator}>
    <div className={styles.dateDisplay}>
      <button
        className={styles.arrowBtn}
        onClick={onPrev}
        aria-label="Previous month"
      >
        <ChevronLeft />
      </button>
      <span className={styles.monthLabel}>{month}</span>
      <button
        className={styles.arrowBtn}
        onClick={onNext}
        aria-label="Next month"
      >
        <ChevronRight />
      </button>
    </div>

    <select
      className={styles.yearSelect}
      value={year}
      onChange={(e) => onYearChange(Number(e.target.value))}
      aria-label="Select year"
    >
      {AVAILABLE_YEARS.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  </div>
);
