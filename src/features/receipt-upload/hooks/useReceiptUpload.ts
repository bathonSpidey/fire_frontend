import { useState } from "react";
import type { ReceiptUploadResponse } from "../types";

export const useReceiptUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ReceiptUploadResponse[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      setFiles(Array.from(selected));
      setError(null);
      setResults([]);
    }
  };

  // Accepts files passed explicitly as parameters or falls back to hook state
  const uploadMultipleReceipts = async (passedFiles?: FileList | File[]) => {
    const filesToUpload = passedFiles ? Array.from(passedFiles) : files;
    if (filesToUpload.length === 0) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:8000/inventory/upload-receipt", {
          method: "POST",
          headers: { accept: "application/json" },
          body: formData,
        });

        if (!response.ok) {
          return {
            status: "Error",
            receipt_id: -1,
            merchant: file.name,
            linked_to_bank_ledger: false,
            message: `Upload failed with status code: ${response.status}`,
          };
        }
        return await response.json();
      });

      const outcomes = await Promise.all(uploadPromises);
      setResults(outcomes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse receipt batch");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults([]);

  return { 
    files, 
    loading, 
    error, 
    results, 
    handleFileChange, 
    uploadMultipleReceipts, 
    setFiles, 
    clearResults 
  };
};