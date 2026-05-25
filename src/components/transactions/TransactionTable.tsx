import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../../api/transactions";
import type { Transaction } from "../../types/api";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../../types/api";
import { Amount } from "../ui/Amount";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/Feedback";
import { EditTransactionModal } from "./EditTransactionModal";
import { AttachReceiptModal } from "./AttachReceiptModal";
import { AttachTransferModal } from "./AttachTransferModal";
import type { Filters } from "./TransactionFilters";

interface TransactionTableProps {
  transactions: Transaction[];
  displayFilters?: Filters;
}

export function TransactionTable({
  transactions,
  displayFilters,
}: TransactionTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [attaching, setAttaching] = useState<Transaction | null>(null);
  const [attachingTransfer, setAttachingTransfer] =
    useState<Transaction | null>(null);
  const [_, setDeleting] = useState<string | null>(null);
  const [showReceiptItems, setShowReceiptItems] = useState<Set<string>>(
    new Set(),
  );

  // Only show top-level transactions, apply display filters
  const topLevel = transactions.filter((tx) => {
    if (tx.is_receipt_item) return false;
    if (
      displayFilters?.type &&
      displayFilters.type !== "all" &&
      tx.transaction_type !== displayFilters.type
    )
      return false;
    if (
      displayFilters?.category &&
      displayFilters.category !== "all" &&
      tx.category !== displayFilters.category
    )
      return false;
    return true;
  });

  if (topLevel.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No transactions"
        description="Upload a bank statement or receipt to get started."
      />
    );
  }

  // Build receipt items map
  const receiptItems = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (tx.is_receipt_item && tx.parent_transaction_id) {
      const group = receiptItems.get(tx.parent_transaction_id) ?? [];
      group.push(tx);
      receiptItems.set(tx.parent_transaction_id, group);
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactions-all"] });
      setDeleting(null);
    },
  });

  function toggleReceiptItems(txId: string) {
    setShowReceiptItems((prev) => {
      const next = new Set(prev);
      next.has(txId) ? next.delete(txId) : next.add(txId);
      return next;
    });
  }

  const grouped = groupByDate(topLevel);

  return (
    <>
      <div
        style={{
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 110px 100px",
            padding: "var(--space-2) var(--space-4)",
            background: "var(--color-surface-2)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          {["Description", "Category", "Amount", ""].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                color: "var(--color-text-3)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {grouped.map(({ date, rows }) => (
          <div key={date}>
            {/* Date group header */}
            <div
              style={{
                padding: "var(--space-2) var(--space-4)",
                background: "var(--color-surface)",
                borderBottom: "1px solid var(--color-border)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.05em",
              }}
            >
              {formatDate(date)}
            </div>

            {rows.map((tx, i) => {
              const items = receiptItems.get(tx.id) ?? [];
              const expanded = showReceiptItems.has(tx.id);
              const isLast = i === rows.length - 1 && !expanded;

              return (
                <div key={tx.id}>
                  <TransactionRow
                    transaction={tx}
                    isLast={isLast}
                    hasReceipt={!!tx.receipt_document_id}
                    receiptItemCount={items.length}
                    isExpanded={expanded}
                    onEdit={() => setEditing(tx)}
                    onAttach={() => setAttaching(tx)}
                    onAttachTransfer={() => setAttachingTransfer(tx)}
                    onDelete={() => {
                      if (confirm(`Delete "${tx.description}"?`))
                        deleteMutation.mutate(tx.id);
                    }}
                    onViewDetail={() => navigate(`/transactions/${tx.id}`)}
                    onToggleItems={
                      items.length > 0
                        ? () => toggleReceiptItems(tx.id)
                        : undefined
                    }
                  />

                  {/* Receipt line items */}
                  {expanded &&
                    items.map((item, j) => (
                      <div
                        key={item.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 140px 110px 100px",
                          alignItems: "center",
                          padding:
                            "var(--space-2) var(--space-4) var(--space-2) var(--space-10)",
                          borderBottom:
                            j < items.length - 1
                              ? "1px solid var(--color-border)"
                              : "none",
                          background: "rgba(245,158,11,0.03)",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--color-text-2)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            ↳ {item.description}
                          </p>
                        </div>
                        <Badge variant="muted" style={{ fontSize: "10px" }}>
                          {CATEGORY_ICONS[item.category]}{" "}
                          {CATEGORY_LABELS[item.category]}
                        </Badge>
                        <div style={{ textAlign: "right" }}>
                          <Amount
                            value={item.amount}
                            type={item.transaction_type}
                            size="sm"
                            showSign
                          />
                        </div>
                        <div />
                      </div>
                    ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {editing && (
        <EditTransactionModal
          transaction={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {attaching && (
        <AttachReceiptModal
          transaction={attaching}
          onClose={() => setAttaching(null)}
        />
      )}
      {attachingTransfer && (
        <AttachTransferModal
          transaction={attachingTransfer}
          onClose={() => setAttachingTransfer(null)}
        />
      )}
    </>
  );
}

// ── Single row ────────────────────────────────────────────────────────────────

function TransactionRow({
  transaction: tx,
  isLast,
  hasReceipt,
  receiptItemCount,
  isExpanded,
  onEdit,
  onAttach,
  onAttachTransfer,
  onViewDetail,
  onDelete,
  onToggleItems,
}: {
  transaction: Transaction;
  isLast: boolean;
  hasReceipt: boolean;
  receiptItemCount: number;
  isExpanded: boolean;
  onEdit: () => void;
  onAttach: () => void;
  onAttachTransfer: () => void;
  onViewDetail: () => void;
  onDelete: () => void;
  onToggleItems?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 140px 110px 100px",
        alignItems: "center",
        padding: "var(--space-3) var(--space-4)",
        borderBottom: isLast ? "none" : "1px solid var(--color-border)",
        background: hovered ? "var(--color-surface-2)" : "var(--color-surface)",
        transition: "background var(--duration-fast)",
      }}
    >
      {/* Description */}
      <div onClick={onEdit} style={{ minWidth: 0, cursor: "pointer" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
          }}
        >
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
          {hasReceipt && (
            <span
              title="Receipt attached"
              style={{ fontSize: "0.7rem", opacity: 0.6, flexShrink: 0 }}
            >
              📎
            </span>
          )}
          {tx.transfer_document_id && (
            <span
              title={`Statement: ${tx.transfer_account_name}`}
              style={{ fontSize: "0.7rem", opacity: 0.7, flexShrink: 0 }}
            >
              🏦
            </span>
          )}
          {tx.transaction_type === "transfer" && (
            <span
              style={{
                fontSize: "10px",
                color: "var(--color-info)",
                background: "rgba(59,130,246,0.1)",
                padding: "1px 5px",
                borderRadius: "999px",
                flexShrink: 0,
              }}
            >
              {tx.transfer_account_name ?? "transfer"}
            </span>
          )}
        </div>
        {tx.merchant && (
          <p
            style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}
          >
            {tx.merchant}
          </p>
        )}
      </div>

      {/* Category */}
      <div onClick={onEdit} style={{ cursor: "pointer" }}>
        <Badge variant="muted">
          {CATEGORY_ICONS[tx.category]} {CATEGORY_LABELS[tx.category]}
        </Badge>
      </div>

      {/* Amount + expand indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "var(--space-2)",
        }}
      >
        <div onClick={onEdit} style={{ cursor: "pointer" }}>
          <Amount
            value={tx.amount}
            type={tx.transaction_type}
            showSign
            size="sm"
          />
        </div>
        {/* Receipt expand — always visible, right-aligned next to amount */}
        {onToggleItems && (
          <button
            onClick={onToggleItems}
            title={isExpanded ? "Hide items" : `Show ${receiptItemCount} items`}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-primary)",
              fontSize: "0.65rem",
              padding: "0",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            {isExpanded ? "▲" : "▼"}
          </button>
        )}
        {/* Transfer expand indicator */}
        {tx.transfer_document_id && (
          <span
            style={{
              fontSize: "0.65rem",
              color: "var(--color-info)",
              flexShrink: 0,
            }}
          >
            🏦
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "1px",
          overflow: "hidden",
        }}
      >
        {/* View detail */}
        <ActionBtn
          onClick={onViewDetail}
          title="View details"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity var(--duration-fast)",
          }}
        >
          →
        </ActionBtn>
        {/* Show either receipt OR transfer button — not both, saves space */}
        {tx.transaction_type === "debit" && !tx.transfer_document_id && (
          <ActionBtn
            onClick={onAttach}
            title={hasReceipt ? "Replace receipt" : "Attach receipt"}
            style={{
              opacity: hovered ? 1 : 0,
              transition: "opacity var(--duration-fast)",
            }}
          >
            🧾
          </ActionBtn>
        )}
        {(tx.transaction_type === "debit" ||
          tx.transaction_type === "transfer") &&
          !tx.is_receipt_item &&
          !tx.receipt_document_id && (
            <ActionBtn
              onClick={onAttachTransfer}
              title={
                tx.transfer_document_id
                  ? "Replace statement"
                  : "Attach bank statement"
              }
              style={{
                opacity: hovered ? 1 : 0,
                transition: "opacity var(--duration-fast)",
              }}
            >
              🏦
            </ActionBtn>
          )}
        {/* Edit */}
        <ActionBtn
          onClick={onEdit}
          title="Edit"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity var(--duration-fast)",
          }}
        >
          ✎
        </ActionBtn>
        {/* Delete */}
        <ActionBtn
          onClick={onDelete}
          title="Delete"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity var(--duration-fast)",
            color: "var(--color-danger)",
          }}
        >
          ✕
        </ActionBtn>
      </div>
    </div>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function ActionBtn({
  children,
  onClick,
  title,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: "20px",
        height: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: "var(--radius-sm)",
        color: "var(--color-text-2)",
        cursor: "pointer",
        fontSize: "0.8rem",
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByDate(transactions: Transaction[]) {
  const map = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    const group = map.get(tx.date) ?? [];
    group.push(tx);
    map.set(tx.date, group);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, rows]) => ({ date, rows }));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
