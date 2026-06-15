import React, { useRef } from "react";
import { useStatementUpload } from "../hooks/useStatementUpload";
import styles from "../styles/UploadPage.module.css";

export const UploadPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { file, loading, error, data, handleFileChange, uploadFile } =
    useStatementUpload();

  const onZoneClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload Bank Statement</h1>
      <p className={styles.description}>
        Upload your bank statement PDF to parse transactions and analyze
        budgets.
      </p>

      <div className={styles.dropzone} onClick={onZoneClick}>
        <input
          type="file"
          accept=".pdf"
          className={styles.fileInput}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div>📄</div>
        {file ? (
          <div className={styles.fileInfo}>
            Selected file: <span className={styles.fileName}>{file.name}</span>
          </div>
        ) : (
          <div className={styles.fileInfo}>
            Click or drag a statement PDF here to select
          </div>
        )}
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      <button
        className={styles.button}
        onClick={uploadFile}
        disabled={!file || loading}
      >
        {loading ? "Processing Statement..." : "Process Statement"}
      </button>

      {data && (
        <div className={styles.successAlert}>
          <div className={styles.successTitle}>✓ Success!</div>
          <p>
            Successfully parsed <strong>{data.transactions.length}</strong>{" "}
            transactions for {data.month} {data.year} ({data.bank}).
          </p>
        </div>
      )}
    </div>
  );
};
