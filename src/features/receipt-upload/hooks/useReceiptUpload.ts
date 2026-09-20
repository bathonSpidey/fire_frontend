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

// One upload flow for everything: the backend lets Claude decide whether each document is a
// receipt or a bank statement, and whether several images belong together.
export const useReceiptUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [owners, setOwners] = useState<string[]>([]);
  const [owner, setOwnerState] = useState<string>(rememberedOwner());
  const [asOneDocument, setAsOneDocument] = useState(false);
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
      const res = await fetch(`${API_BASE}/documents/jobs?limit=30`);
      if (res.ok) setJobs(await res.json());
    } catch {
      /* backend briefly unreachable: keep showing the last known list */
    }
  }, []);

  // Load household members and recent jobs once; pick a sensible default owner.
  useEffect(() => {
    fetch(`${API_BASE}/documents/owners`)
      .then((res) => res.json())
      .then((list: string[]) => {
        setOwners(list);
        setOwnerState((current) => (list.includes(current) ? current : (list[0] ?? "")));
      })
      .catch(() => setError("Cannot reach the backend. Is it running?"));
    fetch(`${API_BASE}/documents/jobs?limit=30`)
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
      setAsOneDocument(false);
      setError(null);
      setRejected([]);
    }
  };

  const uploadFiles = async (toUpload: File[], oneDocument = false) => {
    if (toUpload.length === 0 || !owner) return;
    setUploading(true);
    setError(null);
    setRejected([]);
    try {
      const formData = new FormData();
      formData.append("owner", owner);
      formData.append("group", String(oneDocument && toUpload.length > 1));
      toUpload.forEach((file) => formData.append("files", file));
      const res = await fetch(`${API_BASE}/documents/upload`, { method: "POST", body: formData });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Upload failed (status ${res.status})`);
      }
      const data: UploadResponse = await res.json();
      setRejected(data.rejected);
      setFiles([]);
      setAsOneDocument(false);
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadReceipts = () => uploadFiles(files, asOneDocument);

  // Queue a failed document again without uploading it again.
  const retryJob = async (jobId: number) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/documents/jobs/${jobId}/retry`, { method: "POST" });
      if (!res.ok) {
        const detail = await res.json().catch(() => null);
        throw new Error(detail?.detail ?? `Could not retry (status ${res.status})`);
      }
      await refreshJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retry");
    }
  };

  return {
    files,
    owners,
    owner,
    setOwner,
    asOneDocument,
    setAsOneDocument,
    uploading,
    error,
    rejected,
    jobs,
    anyActive,
    handleFileChange,
    uploadReceipts,
    uploadFiles,
    retryJob,
  };
};
