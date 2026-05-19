import type { UploadResponse, Transaction } from "../../types/api";
import { Amount } from "../ui/Amount";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../../types/api";

interface UploadResultProps {
  result: UploadResponse;
  transactions: Transaction[];
  onUploadAnother: () => void;
  onViewAll: () => void;
}

export function UploadResult({
  result,
  transactions,
  onUploadAnother,
  onViewAll,
}: UploadResultProps) {
  const { document, transactions_extracted } = result;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
      }}
    >
      {/* Success header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "var(--space-5)",
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <span style={{ fontSize: "1.5rem" }}>✓</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 600, color: "var(--color-success)" }}>
            {document.filename}
          </p>
          <p
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-2)" }}
          >
            {transactions_extracted} transaction
            {transactions_extracted !== 1 ? "s" : ""} extracted
          </p>
        </div>
        <Badge variant="success">
          {document.document_type.replace("_", " ")}
        </Badge>
      </div>

      {/* Transaction preview */}
      {transactions.length > 0 && (
        <div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 500,
              color: "var(--color-text-2)",
              marginBottom: "var(--space-3)",
            }}
          >
            Extracted transactions
          </p>
          <div
            style={{
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {transactions.slice(0, 8).map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  borderBottom:
                    i < Math.min(transactions.length, 8) - 1
                      ? "1px solid var(--color-border)"
                      : undefined,
                  background: "var(--color-surface)",
                }}
              >
                <span
                  style={{
                    fontSize: "1rem",
                    width: "24px",
                    textAlign: "center",
                  }}
                >
                  {CATEGORY_ICONS[tx.category]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.description}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    {tx.date} · {CATEGORY_LABELS[tx.category]}
                  </p>
                </div>
                <Amount
                  value={tx.amount}
                  type={tx.transaction_type}
                  size="sm"
                  showSign
                />
              </div>
            ))}

            {transactions.length > 8 && (
              <div
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  background: "var(--color-surface-2)",
                  textAlign: "center",
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-3)",
                }}
              >
                +{transactions.length - 8} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Button variant="primary" onClick={onViewAll} style={{ flex: 1 }}>
          View all transactions →
        </Button>
        <Button variant="outline" onClick={onUploadAnother}>
          Upload another
        </Button>
      </div>
    </div>
  );
}
