import React from "react";
import styles from "../styles/StatementManage.module.css";

interface NavigatorProps {
  month: string;
  year: number;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
  onYearChange: (year: number) => void;
  uploadOpen: boolean;
  onToggleUpload: () => void;
}

const UploadIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

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

const FIRST_YEAR = 2024;
const AVAILABLE_YEARS = Array.from(
  { length: new Date().getFullYear() - FIRST_YEAR + 1 },
  (_, i) => FIRST_YEAR + i,
);

export const DateNavigator: React.FC<NavigatorProps> = ({
  month,
  year,
  onPrev,
  onNext,
  canGoNext,
  onYearChange,
  uploadOpen,
  onToggleUpload,
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
        disabled={!canGoNext}
        aria-label="Next month"
        title={canGoNext ? undefined : "This is the current month"}
        style={canGoNext ? undefined : { opacity: 0.35, cursor: "default" }}
      >
        <ChevronRight />
      </button>
    </div>

    <div className={styles.navigatorRight}>
      <button
        type="button"
        className={`${styles.uploadBtn} ${uploadOpen ? styles.uploadBtnActive : ""}`}
        onClick={onToggleUpload}
        aria-pressed={uploadOpen}
      >
        <UploadIcon />
        {uploadOpen ? "Hide upload" : "Upload"}
      </button>

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
  </div>
);
