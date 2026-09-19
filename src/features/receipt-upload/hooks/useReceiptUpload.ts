import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
import { isActive } from "../types";
import type { IngestJob, UploadResponse } from "../types";

const OWNER_KEY = "fire.owner";
const POLL_MS = 3000;

const rememberedOwner = (): string => {
  try {
    return localStorage.getItem(OWNER_KEY) ?? "";
  } catch {
    return "";
  }
};

export const useReceiptUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [owner, setOwnerState] = useState<string>(rememberedOwner());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejected, setRejected] = useState<UploadResponse["rejected"]>([]);
  const [jobs, setJobs] = useState<IngestJob[]>([]);

  const setOwner = (value: string) => {
    setOwnerState(value);
    try {
      localStorage.setItem(OWNER_KEY, value);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  };

  const refreshJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/receipts/jobs?limit=15`);
      if (res.ok) setJobs(await res.json());
    } catch {
      /* backend briefly unreachable: keep showing the last known list */
    }
  }, []);

  // Load household members and recent jobs once; pick a sensible default owner.
  useEffect(() => {
    fetch(`${API_BASE}/receipts/owners`)
      .then((res) => res.json())
      .then((list: string[]) => {
        setOwners(list);
        setOwnerState((current) => (list.includes(current) ? current : (list[0] ?? "")));
      })
      .catch(() => setError("Cannot reach the backend. Is it running?"));
    fetch(`${API_BASE}/receipts/jobs?limit=15`)
      .then((res) => res.json())
      .then(setJobs)
      .catch(() => undefined);
  }, []);

  // Poll only while something is still being processed.
  const anyActive = jobs.some(isActive);
  useEffect(() => {
    if (!anyActive) return;
    const timer = setInterval(refreshJobs, POLL_MS);
    return () => clearInterval(timer);
  }, [anyActive, refreshJobs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      setFiles(Array.from(selected));
      setError(null);
      setRejected([]);
    }
  };

  const uploadFiles = async (toUpload: File[]) => {
    if (toUpload.length === 0 || !owner) return;
    setUploading(true);
    setError(null);
    setRejected([]);
    try {
      const formData = new FormData();
      formData.append("owner", owner);
      toUpload.forEach((file) => formData.append("files", file));
      const res = await fetch(`${API_BASE}/receipts/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Upload failed (status ${res.status})`);
      }
      const data: UploadResponse = await res.json();
      setRejected(data.rejected);
      setFiles([]);
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadReceipts = () => uploadFiles(files);

  return {
    files,
    owners,
    owner,
    setOwner,
    uploading,
    error,
    rejected,
    jobs,
    anyActive,
    handleFileChange,
    uploadReceipts,
    uploadFiles,
  };
};
