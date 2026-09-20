export type JobStatus =
  | "queued"
  | "processing"
  | "saved"
  | "needs_review"
  | "duplicate"
  | "failed";

// "auto" until Claude has read the document; then what it decided it is.
export type DocumentKind = "auto" | "receipt" | "statement";

export interface IngestJob {
  id: number;
  kind: DocumentKind;
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
