export type JobStatus =
  | "queued"
  | "processing"
  | "saved"
  | "needs_review"
  | "duplicate"
  | "failed";

export interface IngestJob {
  id: number;
  owner: string;
  original_name: string;
  status: JobStatus;
  message: string | null;
  receipt_id: number | null;
  cost_usd: number | null;
  created_at: string;
  finished_at: string | null;
}

export interface UploadResponse {
  jobs: IngestJob[];
  rejected: { filename: string; reason: string }[];
}

export const isActive = (job: IngestJob): boolean =>
  job.status === "queued" || job.status === "processing";
