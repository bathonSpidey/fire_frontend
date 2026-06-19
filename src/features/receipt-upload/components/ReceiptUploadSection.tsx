import React, { useRef, useState } from "react";
import { useReceiptUpload } from "../hooks/useReceiptUpload";
import shared from "../../../shared/styles/upload.module.css";
import styles from "../styles/ReceiptUpload.module.css";

const ReceiptIcon: React.FC = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
    <line x1="8" y1="9" x2="16" y2="9" />
    <line x1="8" y1="13" x2="14" y2="13" />
  </svg>
);
const CheckIcon: React.FC = () => (
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
);
const AlertIcon: React.FC = () => (
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
);
const WarningIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const LinkIcon: React.FC = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

export const ReceiptUploadSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { files, loading, error, results, handleFileChange, uploadMultipleReceipts } = useReceiptUpload();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const dropzoneClass = [
    shared.dropzone,
    isDragging ? shared.dropzoneDrag : "",
    files.length > 0 ? shared.dropzoneHasFile : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.sectionSeparator}>
      <div className={shared.header}>
        <span className={`${shared.badge} ${shared.badgeAi}`}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Smartory Ingestion
        </span>
        <h2 className={shared.title}>Upload store receipts</h2>
        <p className={shared.description}>
          Scan one or multiple receipts to extract raw items automatically.
        </p>
      </div>

      <div
        className={dropzoneClass}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Receipt upload area"
      >
        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          className={shared.fileInput}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div
          className={`${shared.iconWrap} ${files.length > 0 ? shared.iconWrapSuccess : ""}`}
        >
          {files.length > 0 ? <CheckIcon /> : <ReceiptIcon />}
        </div>
        <div className={shared.dzContent}>
          {files.length > 0 ? (
            <>
              <div className={`${shared.dzLabel} ${shared.dzLabelSuccess}`}>
                {files.length} receipt(s) ready
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "6px",
                }}
              >
                {files.map((f, i) => (
                  <div key={i} className={shared.fileChip}>
                    {f.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={shared.dzLabel}>
                Click or drag your receipt PDFs or images here
              </div>
              <div className={shared.dzSub}>
                Supports multiple files up to 20 MB each
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className={shared.errorBox} role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <button className={shared.button} onClick={() => uploadMultipleReceipts()} disabled={files.length === 0 || loading}>
        {loading ? (
          <>
            <span className={shared.spinner} aria-hidden="true" /> Processing
            batch with AI...
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
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>{" "}
            Process batch
          </>
        )}
      </button>

      {/* Results Feed Stack Container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        {results.map((data, index) => {
          const isDuplicate = data.status.includes("Duplicate");
          return isDuplicate ? (
            <div
              key={index}
              className={styles.warningCard}
              role="status"
              aria-live="polite"
            >
              <div className={styles.warningTitle}>
                <WarningIcon />
                {data.status}
              </div>
              <div className={styles.warningMeta}>{data.message}</div>
              <div className={shared.statsRow}>
                <span className={shared.statPill}>ID: #{data.receipt_id}</span>
                <span className={shared.statPill}>
                  Merchant: {data.merchant}
                </span>
                {data.linked_to_bank_ledger && (
                  <span
                    className={`${shared.statPill} ${shared.statPillAccent}`}
                  >
                    <LinkIcon /> Linked to ledger
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              key={index}
              className={shared.successCard}
              role="status"
              aria-live="polite"
            >
              <div className={shared.successIcon}>
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
                <div className={shared.successTitle}>
                  Receipt processed successfully
                </div>
                <div className={shared.successMeta}>
                  Parsed items from {data.merchant || "Store"} and matched them
                  to your catalog tracking profiles.
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
