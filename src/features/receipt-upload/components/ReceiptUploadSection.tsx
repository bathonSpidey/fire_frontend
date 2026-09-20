import React, { useRef, useState } from "react";
import { useReceiptUpload } from "../hooks/useReceiptUpload";
import { isActive } from "../types";
import type { IngestJob } from "../types";

const BANKS = ["Sparkasse", "N26", "Commerzbank", "PayPal"];
import shared from "../../../shared/styles/upload.module.css";
import styles from "../styles/ReceiptUpload.module.css";

const DocumentIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);
const CheckIcon: React.FC = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const AlertIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const STATUS_LABEL: Record<IngestJob["status"], string> = {
  queued: "Waiting in queue",
  processing: "Reading and linking...",
  saved: "Saved",
  needs_review: "Saved - please check",
  duplicate: "Already stored",
  failed: "Not saved",
};

const KIND_LABEL: Record<IngestJob["kind"], string> = {
  auto: "Reading...",
  receipt: "Receipt",
  statement: "Bank statement",
  recategorize: "Category re-check",
};

export const ReceiptUploadSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showOlder, setShowOlder] = useState(false);
  const {
    files,
    owners,
    owner,
    setOwner,
    asOneDocument,
    setAsOneDocument,
    bankHint,
    setBankHint,
    uploading,
    error,
    rejected,
    jobs,
    handleFileChange,
    uploadReceipts,
    retryJob,
    confirmJob,
    rereadJob,
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

  const RECENT_COUNT = 4; // keep the page short; older jobs are one click away
  const visibleJobs = showOlder ? jobs : jobs.slice(0, RECENT_COUNT);
  const olderCount = jobs.length - RECENT_COUNT;

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
        <span className={`${shared.badge} ${shared.badgeAi}`}>Smartory Ingestion</span>
        <h2 className={shared.title}>Upload receipts and bank statements</h2>
        <p className={shared.description}>
          Just drop them in: PDFs, photos or screenshots. The app works out what each one is, files
          it by month and matches payments to receipts and to your other accounts.
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

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span className={shared.dzSub}>Bank statement screenshot from</span>
        <select
          value={bankHint}
          onChange={(e) => setBankHint(e.target.value)}
          className={shared.fileChip}
          style={{ cursor: "pointer" }}
          aria-label="Which bank the screenshots are from"
        >
          <option value="">Not sure / not a screenshot</option>
          {BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
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
        aria-label="Document upload area"
      >
        <input
          type="file"
          multiple
          accept=".pdf,.csv,image/*"
          className={shared.fileInput}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div className={`${shared.iconWrap} ${files.length > 0 ? shared.iconWrapSuccess : ""}`}>
          {files.length > 0 ? <CheckIcon /> : <DocumentIcon />}
        </div>
        <div className={shared.dzContent}>
          {files.length > 0 ? (
            <>
              <div className={`${shared.dzLabel} ${shared.dzLabelSuccess}`}>
                {files.length} file(s) ready
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                {files.map((f, i) => (
                  <div key={i} className={shared.fileChip}>
                    {f.name}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={shared.dzLabel}>Click or drag your files here</div>
              <div className={shared.dzSub}>Receipts, statements, screenshots - up to 20 MB each</div>
            </>
          )}
        </div>
      </div>

      {files.length > 1 && (
        <label
          style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={asOneDocument}
            onChange={(e) => setAsOneDocument(e.target.checked)}
            style={{ marginTop: "4px" }}
          />
          <span>
            <strong>These {files.length} files are ONE document</strong>
            <span className={shared.dzSub} style={{ display: "block" }}>
              For example several screenshots of one bank statement. They are read together, in
              the order shown above. Leave it off if they are separate receipts.
            </span>
          </span>
        </label>
      )}

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
          <>{files.length > 0 ? `Upload ${files.length} file(s)` : "Upload"}</>
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
          {visibleJobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onRetry={() => retryJob(job.id)}
              onConfirm={(date) => confirmJob(job.id, date)}
              onReread={(bank) => rereadJob(job.id, bank)}
            />
          ))}
          {olderCount > 0 && (
            <button
              type="button"
              className={shared.dzSub}
              style={{ cursor: "pointer", background: "none", border: "none", textAlign: "left", padding: 0 }}
              onClick={() => setShowOlder(!showOlder)}
            >
              {showOlder ? "Show fewer" : `Show older (${olderCount})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const JobActions: React.FC<{
  job: IngestJob;
  onConfirm: (date?: string) => void;
  onReread: (bank?: string) => void;
}> = ({ job, onConfirm, onReread }) => {
  const [date, setDate] = useState("");
  const [bank, setBank] = useState("");
  const needsCheck = job.status === "needs_review";
  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginTop: "4px" }}>
      {needsCheck && job.kind === "receipt" && (
        <label className={shared.dzSub}>
          Purchase date{" "}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      )}
      {needsCheck && (
        <button type="button" className={shared.fileChip} style={{ cursor: "pointer" }} onClick={() => onConfirm(date || undefined)}>
          {date ? "Save date and confirm" : "Looks fine"}
        </button>
      )}
      {job.kind === "statement" && (
        <select value={bank} onChange={(e) => setBank(e.target.value)} className={shared.fileChip} aria-label="Read again as bank">
          <option value="">Bank: let Claude decide</option>
          {BANKS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      )}
      <button type="button" className={shared.fileChip} style={{ cursor: "pointer" }} onClick={() => onReread(bank || undefined)}>
        Read again{job.kind === "statement" && bank ? ` as ${bank}` : ""}
      </button>
    </div>
  );
};

const JobRow: React.FC<{
  job: IngestJob;
  onRetry: () => void;
  onConfirm: (date?: string) => void;
  onReread: (bank?: string) => void;
}> = ({ job, onRetry, onConfirm, onReread }) => {
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
        <span className={shared.statPill}>{KIND_LABEL[job.kind]}</span>
        <span className={shared.statPill}>{STATUS_LABEL[job.status]}</span>
      </div>
      {job.message && !active && <div className={styles.warningMeta}>{job.message}</div>}
      {(job.status === "saved" || job.status === "needs_review") &&
        (job.kind === "receipt" || job.kind === "statement") &&
        !(job.message ?? "").includes("Read again as job") && (
          <JobActions job={job} onConfirm={onConfirm} onReread={onReread} />
        )}
      {job.status === "failed" && !(job.message ?? "").includes("Retried as job") && (
        <div>
          <button type="button" className={shared.fileChip} style={{ cursor: "pointer" }} onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
};
