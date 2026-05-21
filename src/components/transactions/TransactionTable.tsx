import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Transaction } from "../../types/api";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../../types/api";
import { Amount } from "../ui/Amount";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/Feedback";
import { EditTransactionModal } from "./EditTransactionModal";
import { AttachReceiptModal } from "./AttachReceiptModal";

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
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [attaching, setAttaching] = useState<Transaction | null>(null);
  const [showReceiptItems, setShowReceiptItems] = useState<Set<string>>(
    new Set(),
  );

  // Only show top-level transactions by default
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

  // Group receipt items by parent
  const receiptItems = new Map<string, Transaction[]>();
  for (const tx of transactions) {
    if (tx.is_receipt_item && tx.parent_transaction_id) {
      const group = receiptItems.get(tx.parent_transaction_id) ?? [];
      group.push(tx);
      receiptItems.set(tx.parent_transaction_id, group);
    }
  }

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
            gridTemplateColumns: "1fr 140px 120px 72px",
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
                          gridTemplateColumns: "1fr 140px 120px 72px",
                          alignItems: "center",
                          padding:
                            "var(--space-2) var(--space-4) var(--space-2) var(--space-10)",
                          borderBottom:
                            j < items.length - 1 || !isLast
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
  onViewDetail,
  onToggleItems,
}: {
  transaction: Transaction;
  isLast: boolean;
  hasReceipt: boolean;
  receiptItemCount: number;
  isExpanded: boolean;
  onEdit: () => void;
  onAttach: () => void;
  onViewDetail: () => void;
  onToggleItems?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 140px 120px 72px",
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

      {/* Amount */}
      <div onClick={onEdit} style={{ textAlign: "right", cursor: "pointer" }}>
        <Amount
          value={tx.amount}
          type={tx.transaction_type}
          showSign
          size="sm"
        />
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "4px",
        }}
      >
        {/* Receipt toggle — always visible when receipt attached */}
        {onToggleItems && (
          <ActionBtn
            onClick={onToggleItems}
            title={isExpanded ? "Hide items" : `Show ${receiptItemCount} items`}
            style={{ opacity: 1, color: "var(--color-primary)" }}
          >
            {isExpanded ? "▲" : "▼"}
          </ActionBtn>
        )}
        {/* View detail page */}
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
        {/* Attach receipt — only on debits */}
        {tx.transaction_type === "debit" && (
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
      </div>
    </div>
  );
}

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
        width: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: "var(--radius-sm)",
        color: "var(--color-text-2)",
        cursor: "pointer",
        fontSize: "0.85rem",
        transition: "background var(--duration-fast)",
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
