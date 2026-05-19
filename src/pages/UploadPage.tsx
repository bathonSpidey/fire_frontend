import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { documentsApi } from "../api/documents";
import { transactionsApi } from "../api/transactions";
import { useActiveUser } from "../store/useUserStore";
import { PageHeader } from "../components/layouts/PageHeader";
import { DropZone } from "../components/upload/Dropzone";
import { DocumentTypeSelector } from "../components/upload/DocumentTypeSelector";
import { UploadResult } from "../components/upload/UploadResult";
import { Card } from "../components/ui/Card";
import { ErrorMessage, LoadingSpinner } from "../components/ui/Feedback";
import type { DocumentType, UploadResponse } from "../types/api";

type UploadState =
  | { status: "idle" }
  | { status: "selected"; file: File }
  | { status: "uploading" }
  | { status: "done"; result: UploadResponse }
  | { status: "error"; message: string };

export function UploadPage() {
  const navigate = useNavigate();
  const user = useActiveUser();
  const [docType, setDocType] = useState<DocumentType>("unknown");
  const [state, setState] = useState<UploadState>({ status: "idle" });

  const uploadMutation = useMutation({
    mutationFn: ({ file }: { file: File }) =>
      documentsApi.upload(file, user!.id, docType),
    onSuccess: (result) => setState({ status: "done", result }),
    onError: (err: Error) =>
      setState({ status: "error", message: err.message }),
  });

  // Fetch the extracted transactions once upload is done
  const transactionsQuery = useQuery({
    queryKey: [
      "transactions",
      user?.id,
      state.status === "done" && state.result.document.id,
    ],
    queryFn: () => transactionsApi.list(user!.id),
    enabled: state.status === "done",
  });

  function handleFile(file: File) {
    setState({ status: "selected", file });
  }

  function handleUpload() {
    if (state.status !== "selected") return;
    setState({ status: "uploading" });
    uploadMutation.mutate({ file: state.file });
  }

  function handleReset() {
    setState({ status: "idle" });
    uploadMutation.reset();
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PageHeader
        title="Upload"
        subtitle="Add a bank statement, receipt, or investment report"
      />

      <div
        style={{
          flex: 1,
          padding: "var(--space-8)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "var(--space-6)",
          alignContent: "start",
          maxWidth: "960px",
        }}
      >
        {/* Left — upload controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          {state.status === "done" ? (
            <UploadResult
              result={state.result}
              transactions={transactionsQuery.data ?? []}
              onUploadAnother={handleReset}
              onViewAll={() => navigate("/transactions")}
            />
          ) : (
            <>
              <DropZone
                onFile={handleFile}
                disabled={state.status === "uploading"}
              />

              {/* Selected file preview */}
              {state.status === "selected" && (
                <FilePreview file={state.file} onRemove={handleReset} />
              )}

              {state.status === "error" && (
                <ErrorMessage
                  message={(state as { message: string }).message}
                />
              )}
            </>
          )}
        </div>

        {/* Right — type selector + upload button */}
        {state.status !== "done" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-5)",
            }}
          >
            <Card>
              <DocumentTypeSelector value={docType} onChange={setDocType} />
            </Card>

            {/* Tips */}
            <Card
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  color: "var(--color-text-3)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "var(--space-3)",
                }}
              >
                Tips
              </p>
              {TIPS.map((tip, i) => (
                <p
                  key={i}
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-2)",
                    marginBottom: "var(--space-2)",
                    paddingLeft: "var(--space-4)",
                    borderLeft: "2px solid var(--color-border-2)",
                  }}
                >
                  {tip}
                </p>
              ))}
            </Card>

            {/* Upload button */}
            {state.status === "selected" && (
              <button
                onClick={handleUpload}
                style={{
                  padding: "var(--space-4)",
                  background: "var(--color-primary)",
                  color: "#000",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "var(--text-base)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-2)",
                  transition: "opacity var(--duration-fast)",
                }}
              >
                Upload & Extract
              </button>
            )}

            {state.status === "uploading" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-4)",
                  color: "var(--color-text-2)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <LoadingSpinner size={20} />
                Extracting transactions…
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── File preview strip ────────────────────────────────────────────────────────

function FilePreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isImage = file.type.startsWith("image/");
  const sizeKB = Math.round(file.size / 1024);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-surface-2)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>
        {isImage ? "🖼️" : "📄"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: 500,
            color: "var(--color-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file.name}
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
          {sizeKB} KB · {file.type || "unknown type"}
        </p>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "var(--color-text-3)",
          cursor: "pointer",
          fontSize: "1.1rem",
          padding: "var(--space-1)",
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}

const TIPS = [
  "PDFs are parsed locally — no data sent to any API.",
  "Receipt images are read by Gemini and returned as structured data.",
  "Re-uploading the same file re-extracts transactions.",
  "You can edit any transaction after extraction.",
];
