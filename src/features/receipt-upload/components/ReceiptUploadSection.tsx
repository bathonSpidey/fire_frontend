import React, { useRef, useState } from "react";
import { useReceiptUpload } from "../hooks/useReceiptUpload";
import { isActive } from "../types";
import type { IngestJob } from "../types";
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

export const ReceiptUploadSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const {
    files,
    owners,
    owner,
    setOwner,
    uploading,
    error,
    rejected,
    jobs,
    handleFileChange,
    uploadReceipts,
  } = useReceiptUpload();

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
          Upload receipts as you get them during the month. They are read in the background and
          filed by month automatically.
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span className={shared.dzSub}>Uploading as</span>
        {owners.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setOwner(name)}
            className={shared.fileChip}
            aria-pressed={owner === name}
            style={{
              cursor: "pointer",
              fontWeight: owner === name ? 700 : 400,
              outline: owner === name ? "2px solid currentColor" : "none",
            }}
          >
            {name}
          </button>
        ))}
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

      <button
        className={shared.button}
        onClick={uploadReceipts}
        disabled={files.length === 0 || uploading || !owner}
      >
        {uploading ? (
          <>
            <span className={shared.spinner} aria-hidden="true" /> Uploading...
          </>
        ) : (
          <>Upload {files.length > 0 ? files.length + " file(s)" : "receipts"}</>
        )}
      </button>

      {rejected.map((r, i) => (
        <div key={"rej-" + i} className={shared.errorBox} role="alert">
          <AlertIcon />
          <span>
            {r.filename}: {r.reason}
          </span>
        </div>
      ))}

      {jobs.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
          <div className={shared.dzSub}>Recent uploads</div>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

const STATUS_LABEL: Record<IngestJob["status"], string> = {
  queued: "Waiting in queue",
  processing: "Reading receipt...",
  saved: "Saved",
  needs_review: "Saved - needs your review",
  duplicate: "Already stored",
  failed: "Failed",
};

const JobRow: React.FC<{ job: IngestJob }> = ({ job }) => {
  const active = isActive(job);
  const cardClass =
    job.status === "failed"
      ? shared.errorBox
      : job.status === "duplicate" || job.status === "needs_review"
        ? styles.warningCard
        : shared.successCard;
  return (
    <div className={cardClass} role="status" aria-live="polite">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        {active ? <span className={shared.spinner} aria-hidden="true" /> : null}
        <strong>{job.original_name}</strong>
        <span className={shared.statPill}>{job.owner}</span>
        <span className={shared.statPill}>{STATUS_LABEL[job.status]}</span>
        {job.receipt_id !== null && <span className={shared.statPill}>#{job.receipt_id}</span>}
      </div>
      {job.message && !active && <div className={styles.warningMeta}>{job.message}</div>}
    </div>
  );
};
