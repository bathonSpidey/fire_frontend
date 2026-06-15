import React, { useRef, useState } from "react";
import { useStatementUpload } from "../hooks/useStatementUpload";
import styles from "../styles/UploadPage.module.css";

export const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { file, loading, error, data, handleFileChange, uploadFile } =
    useStatementUpload();

  const onZoneClick = () => fileInputRef.current?.click();

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) {
      const syntheticEvent = {
        target: { files: [dropped] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
  };

  const dropzoneClass = [
    styles.dropzone,
    isDragging ? styles.dropzoneDrag : "",
    file ? styles.dropzoneHasFile : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.badge}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Secure upload
        </span>
        <h1 className={styles.title}>Upload bank statement</h1>
        <p className={styles.description}>
          Parse your PDF to extract transactions and analyze spending patterns.
        </p>
      </div>

      <div
        className={dropzoneClass}
        onClick={onZoneClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
      >
        <input
          type="file"
          accept=".pdf"
          className={styles.fileInput}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div
          className={`${styles.iconWrap} ${file ? styles.iconWrapSuccess : ""}`}
        >
          {file ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
        </div>

        {file ? (
          <div className={styles.dzContent}>
            <div className={`${styles.dzLabel} ${styles.dzLabelSuccess}`}>
              File ready
            </div>
            <div className={styles.fileChip}>{file.name}</div>
          </div>
        ) : (
          <div className={styles.dzContent}>
            <div className={styles.dzLabel}>Click or drag your PDF here</div>
            <div className={styles.dzSub}>Supports .pdf up to 20 MB</div>
          </div>
        )}
      </div>

      {error && (
        <div className={styles.errorBox} role="alert">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.divider} />

      <button
        className={styles.button}
        onClick={uploadFile}
        disabled={!file || loading}
      >
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            Processing statement...
          </>
        ) : (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Process statement
          </>
        )}
      </button>

      {data && (
        <div className={styles.successCard} role="status" aria-live="polite">
          <div className={styles.successIcon}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <div className={styles.successTitle}>
              Statement parsed successfully
            </div>
            <div className={styles.successMeta}>
              Found {data.transactions.length} transactions · {data.month}{" "}
              {data.year} · {data.bank}
            </div>
            <div className={styles.statsRow}>
              <span className={styles.statPill}>
                {data.transactions.length} transactions
              </span>
              <span className={styles.statPill}>
                {data.month} {data.year}
              </span>
              <span className={styles.statPill}>{data.bank}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
