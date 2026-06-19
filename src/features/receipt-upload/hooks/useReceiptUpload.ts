import { useState } from "react";
import type { ReceiptUploadResponse } from "../types";

export const useReceiptUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReceiptUploadResponse | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      setData(null);
    }
  };

  const uploadReceipt = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/inventory/upload-receipt", {
        method: "POST",
        headers: { accept: "application/json" },
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      
      const result: ReceiptUploadResponse = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse receipt");
    } finally {
      setLoading(false);
    }
  };

  return { file, loading, error, data, handleFileChange, uploadReceipt, setFile };
};