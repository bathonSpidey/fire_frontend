import React from "react";
import styles from "../styles/MonthlyInventory.module.css";

interface UploadResult {
  merchant?: string;
  status?: string;
  message?: string;
}

interface BulkFeedbackPanelProps {
  results: UploadResult[];
  onDismiss: () => void;
}

const CheckIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const SkipIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const BulkFeedbackPanel: React.FC<BulkFeedbackPanelProps> = ({
  results,
  onDismiss,
}) => {
  const successCount = results.filter(
    (r) => !r.status?.includes("Skipped"),
  ).length;
  const skippedCount = results.length - successCount;

  return (
    <div className={styles.bulkFeedbackPanel} role="status" aria-live="polite">
      <div className={styles.bulkFeedbackHeader}>
        <div className={styles.bulkFeedbackTitle}>
          Processed {results.length} file{results.length !== 1 ? "s" : ""}
          <span className={styles.bulkSummaryPills}>
            {successCount > 0 && (
              <span className={styles.bulkPillSuccess}>
                {successCount} added
              </span>
            )}
            {skippedCount > 0 && (
              <span className={styles.bulkPillWarning}>
                {skippedCount} skipped
              </span>
            )}
          </span>
        </div>
        <button
          className={styles.dismissBtn}
          onClick={onDismiss}
          aria-label="Dismiss results"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <ul className={styles.bulkResultList}>
        {results.map((res, i) => {
          const isSkipped = res.status?.includes("Skipped");
          return (
            <li
              key={i}
              className={`${styles.bulkResultItem} ${isSkipped ? styles.bulkResultWarning : styles.bulkResultSuccess}`}
            >
              <span className={styles.bulkResultIcon}>
                {isSkipped ? <SkipIcon /> : <CheckIcon />}
              </span>
              <span>
                <strong>{res.merchant ?? "Receipt"}</strong>:{" "}
                {res.status ?? "Processed"} — {res.message ?? ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
