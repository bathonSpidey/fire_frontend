import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../../api/transactions";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/Feedback";
import { Amount } from "../ui/Amount";
import type { Transaction } from "../../types/api";

interface AttachReceiptModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function AttachReceiptModal({
  transaction,
  onClose,
}: AttachReceiptModalProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  const mutation = useMutation({
    mutationFn: () => transactionsApi.attachReceipt(transaction.id, file!),
    onSuccess: () => {
      // Invalidate all transaction queries — list, detail, and items page
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", transaction.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["transaction-items", transaction.id],
      });
      onClose();
    },
  });

  function handleFile(f: File) {
    setFile(f);
    mutation.reset();
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "var(--space-4)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-lg)",
                fontWeight: 700,
                marginBottom: "var(--space-1)",
              }}
            >
              Attach receipt
            </h3>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-2)",
              }}
            >
              {transaction.description}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-3)",
              cursor: "pointer",
              fontSize: "1.2rem",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Transaction summary */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-surface-2)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}
          >
            {transaction.date} ·{" "}
            {transaction.merchant ?? transaction.description}
          </span>
          <Amount
            value={transaction.amount}
            type={transaction.transaction_type}
            size="sm"
            showSign
          />
        </div>

        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
          }}
          style={{
            border: `2px dashed ${dragging ? "var(--color-primary)" : "var(--color-border-2)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-8)",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(245,158,11,0.04)" : "transparent",
            transition: "all var(--duration-base) var(--ease-out)",
          }}
        >
          {file ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span style={{ fontSize: "2rem" }}>
                {file.type.startsWith("image/") ? "🖼️" : "📄"}
              </span>
              <p
                style={{
                  fontWeight: 500,
                  color: "var(--color-text)",
                  fontSize: "var(--text-sm)",
                }}
              >
                {file.name}
              </p>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-3)",
                }}
              >
                {Math.round(file.size / 1024)} KB · click to change
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-2)",
              }}
            >
              <span style={{ fontSize: "2rem", opacity: 0.4 }}>🧾</span>
              <p
                style={{
                  color: "var(--color-text-2)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Drop receipt here or click to browse
              </p>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-3)",
                }}
              >
                PNG, JPG, WEBP
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
        </div>

        {/* Success state */}
        {mutation.isSuccess && (
          <div
            style={{
              padding: "var(--space-3)",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-success)",
              fontSize: "var(--text-sm)",
              textAlign: "center",
            }}
          >
            ✓ Receipt attached successfully
          </div>
        )}

        {mutation.isError && (
          <ErrorMessage message="Failed to attach receipt. Try again." />
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button
            variant="primary"
            fullWidth
            disabled={!file}
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            Extract & attach
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
