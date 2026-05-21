import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../../api/transactions";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/Feedback";
import { Amount } from "../ui/Amount";
import type { Transaction } from "../../types/api";

const KNOWN_BANKS = [
  "N26",
  "Commerzbank",
  "DKB",
  "ING",
  "Comdirect",
  "Trade Republic",
  "Other",
];

interface AttachTransferModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function AttachTransferModal({
  transaction,
  onClose,
}: AttachTransferModalProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [accountName, setAccountName] = useState(
    transaction.transfer_account_name ?? "",
  );
  const [customName, setCustomName] = useState("");
  const [dragging, setDragging] = useState(false);

  const effectiveName = accountName === "Other" ? customName : accountName;

  const mutation = useMutation({
    mutationFn: () =>
      transactionsApi.attachTransfer(transaction.id, effectiveName, file!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", transaction.id],
      });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
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
          maxWidth: "460px",
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
              Attach bank statement
            </h3>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-2)",
              }}
            >
              Link the investment account statement to this transfer
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
            }}
          >
            ✕
          </button>
        </div>

        {/* Transfer summary */}
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
          <div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: "var(--color-text)",
              }}
            >
              {transaction.description}
            </p>
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
              }}
            >
              {transaction.date}
            </p>
          </div>
          <Amount
            value={transaction.amount}
            type={transaction.transaction_type}
            size="sm"
            showSign
          />
        </div>

        {/* Bank selector */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <label
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--color-text-3)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Investment bank
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-2)",
            }}
          >
            {KNOWN_BANKS.map((bank) => (
              <button
                key={bank}
                onClick={() => setAccountName(bank)}
                style={{
                  padding: "var(--space-2) var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${accountName === bank ? "var(--color-primary)" : "var(--color-border)"}`,
                  background:
                    accountName === bank
                      ? "rgba(245,158,11,0.08)"
                      : "var(--color-surface-2)",
                  color:
                    accountName === bank
                      ? "var(--color-primary)"
                      : "var(--color-text-2)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-xs)",
                  fontWeight: accountName === bank ? 600 : 400,
                  cursor: "pointer",
                  transition: "all var(--duration-fast)",
                }}
              >
                {bank}
              </button>
            ))}
          </div>
          {accountName === "Other" && (
            <input
              autoFocus
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Bank name"
              style={{
                padding: "var(--space-2) var(--space-3)",
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border-2)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-sm)",
                outline: "none",
              }}
            />
          )}
        </div>

        {/* File drop zone */}
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
            padding: "var(--space-6)",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(245,158,11,0.04)" : "transparent",
            transition: "all var(--duration-base)",
          }}
        >
          {file ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--space-1)",
              }}
            >
              <span style={{ fontSize: "1.5rem" }}>📄</span>
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
              <span style={{ fontSize: "1.5rem", opacity: 0.4 }}>📄</span>
              <p
                style={{
                  color: "var(--color-text-2)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Drop PDF or click to browse
              </p>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />
        </div>

        {mutation.isError && (
          <ErrorMessage message="Failed to attach statement. Try again." />
        )}

        <div style={{ display: "flex", gap: "var(--space-3)" }}>
          <Button
            variant="primary"
            fullWidth
            disabled={!file || !effectiveName.trim()}
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
