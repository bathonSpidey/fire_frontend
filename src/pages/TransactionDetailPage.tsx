import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { PageHeader } from "../components/layouts/PageHeader";
import { ReceiptItemsTable } from "../components/transactions/ReceiptItemsTable";
import { AttachReceiptModal } from "../components/transactions/AttachReceiptModal";
import { EditTransactionModal } from "../components/transactions/EditTransactionModal";
import { Card } from "../components/ui/Card";
import { Amount } from "../components/ui/Amount";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import {
  LoadingSpinner,
  EmptyState,
  ErrorMessage,
} from "../components/ui/Feedback";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types/api";

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showAttach, setShowAttach] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionsApi.get(id!),
    enabled: !!id,
  });

  // Dedicated endpoint — only fetches items for this transaction
  const { data: receiptItems = [] } = useQuery({
    queryKey: ["transaction-items", id],
    queryFn: () => transactionsApi.getItems(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "var(--space-16)",
        }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <ErrorMessage
        message="Transaction not found."
        style={{ margin: "var(--space-8)" }}
      />
    );
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <PageHeader
        title={transaction.merchant ?? transaction.description}
        subtitle={transaction.date}
        action={
          <div style={{ display: "flex", gap: "var(--space-2)" }}>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              ← Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEdit(true)}
            >
              Edit
            </Button>
          </div>
        }
      />

      <div
        style={{
          padding: "var(--space-6) var(--space-8) var(--space-12)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          maxWidth: "800px",
        }}
      >
        {/* Transaction summary card */}
        <Card
          accent
          style={{
            borderLeftColor:
              transaction.transaction_type === "credit"
                ? "var(--color-success)"
                : "var(--color-danger)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              <Amount
                value={transaction.amount}
                type={transaction.transaction_type}
                size="xl"
                showSign
              />
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  flexWrap: "wrap",
                }}
              >
                <Badge
                  variant={
                    transaction.transaction_type === "credit"
                      ? "success"
                      : "danger"
                  }
                >
                  {transaction.transaction_type}
                </Badge>
                <Badge variant="default">
                  {CATEGORY_ICONS[transaction.category]}{" "}
                  {CATEGORY_LABELS[transaction.category]}
                </Badge>
                {transaction.is_recurring && (
                  <Badge variant="info">recurring</Badge>
                )}
                {transaction.receipt_document_id && (
                  <Badge variant="warning">📎 receipt attached</Badge>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                textAlign: "right",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-2)",
                }}
              >
                {transaction.date}
              </p>
              {transaction.merchant && (
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-2)",
                  }}
                >
                  {transaction.merchant}
                </p>
              )}
              {transaction.notes && (
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                    maxWidth: "200px",
                  }}
                >
                  {transaction.notes}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Receipt items section */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 700,
                }}
              >
                Receipt items
              </h2>
              {receiptItems.length > 0 && (
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-3)",
                    marginTop: "var(--space-1)",
                  }}
                >
                  {receiptItems.length} items · searchable purchase history
                </p>
              )}
            </div>
            {transaction.transaction_type === "debit" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAttach(true)}
              >
                {transaction.receipt_document_id
                  ? "↑ Replace receipt"
                  : "+ Attach receipt"}
              </Button>
            )}
          </div>

          {receiptItems.length > 0 ? (
            <ReceiptItemsTable items={receiptItems} />
          ) : (
            <EmptyState
              icon="🧾"
              title="No receipt attached"
              description="Attach a receipt image to see individual items and build your purchase history."
              action={
                transaction.transaction_type === "debit" ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAttach(true)}
                  >
                    Attach receipt
                  </Button>
                ) : undefined
              }
            />
          )}
        </div>
      </div>

      {showAttach && (
        <AttachReceiptModal
          transaction={transaction}
          onClose={() => setShowAttach(false)}
        />
      )}
      {showEdit && (
        <EditTransactionModal
          transaction={transaction}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
