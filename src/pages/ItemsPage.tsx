import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { useActiveUser } from "../store/useUserStore";
import { PageHeader } from "../components/layouts/PageHeader";
import { MonthPicker } from "../components/transactions/MonthPicker";
import { Amount } from "../components/ui/Amount";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner, EmptyState } from "../components/ui/Feedback";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types/api";
import type { Transaction, MonthYear } from "../types/api";

export function ItemsPage() {
  const user = useActiveUser();
  const navigate = useNavigate();
  const now = new Date();

  const [period, setPeriod] = useState<MonthYear>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Fetch ALL transactions — filter client-side by parent date
  // Receipt items may have different dates than their parent bank transaction
  const { data: allTransactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => transactionsApi.list(user!.id),
    enabled: !!user,
  });

  // Group: find parent transactions that have receipts, then their items
  // Filter parents by selected month — items follow the parent's date
  const receiptGroups = useMemo(() => {
    const monthStr = `${period.year}-${String(period.month).padStart(2, "0")}`;
    const parents = allTransactions.filter(
      (tx) =>
        !tx.is_receipt_item &&
        tx.receipt_document_id &&
        tx.date.startsWith(monthStr),
    );
    const itemsByParent = new Map<string, Transaction[]>();
    for (const tx of allTransactions) {
      if (tx.is_receipt_item && tx.parent_transaction_id) {
        const group = itemsByParent.get(tx.parent_transaction_id) ?? [];
        group.push(tx);
        itemsByParent.set(tx.parent_transaction_id, group);
      }
    }
    return parents
      .map((parent) => ({
        parent,
        items: itemsByParent.get(parent.id) ?? [],
      }))
      .filter(({ items }) => items.length > 0)
      .sort((a, b) => b.parent.date.localeCompare(a.parent.date));
  }, [allTransactions, period]);

  // Filter items by search across all groups
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return receiptGroups;
    const q = search.toLowerCase();
    return receiptGroups
      .map(({ parent, items }) => ({
        parent,
        items: items.filter(
          (i) =>
            i.description.toLowerCase().includes(q) ||
            (i.merchant?.toLowerCase().includes(q) ?? false) ||
            CATEGORY_LABELS[i.category].toLowerCase().includes(q),
        ),
      }))
      .filter(({ items }) => items.length > 0);
  }, [receiptGroups, search]);

  function toggleGroup(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalItems = receiptGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <PageHeader
        title="Items"
        subtitle={`${totalItems} receipt items across ${receiptGroups.length} receipts`}
        action={<MonthPicker value={period} onChange={setPeriod} />}
      />

      <div
        style={{
          padding: "var(--space-6) var(--space-8) var(--space-12)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items across all receipts…"
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            outline: "none",
            maxWidth: "480px",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-primary)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
        />

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "var(--space-16)",
            }}
          >
            <LoadingSpinner />
          </div>
        ) : receiptGroups.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No receipts this month"
            description="Attach receipts to bank transactions to see item breakdowns."
          />
        ) : filteredGroups.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matches"
            description={`Nothing matches "${search}"`}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {filteredGroups.map(({ parent, items }) => (
              <ReceiptCard
                key={parent.id}
                parent={parent}
                items={items}
                isExpanded={expanded.has(parent.id) || !!search}
                onToggle={() => toggleGroup(parent.id)}
                onViewTransaction={() => navigate(`/transactions/${parent.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Receipt card ──────────────────────────────────────────────────────────────

function ReceiptCard({
  parent,
  items,
  isExpanded,
  onToggle,
  onViewTransaction,
}: {
  parent: Transaction;
  items: Transaction[];
  isExpanded: boolean;
  onToggle: () => void;
  onViewTransaction: () => void;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (i) =>
        i.description.toLowerCase().includes(q) ||
        CATEGORY_LABELS[i.category].toLowerCase().includes(q),
    );
  }, [items, search]);

  const itemsTotal = items.reduce((sum, i) => sum + parseFloat(i.amount), 0);
  const bankAmount = parseFloat(parent.amount);
  const saved = itemsTotal - bankAmount; // positive = you saved (discounts)

  // Category summary for collapsed view
  const topCategories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);
  }, [items]);

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {/* Card header — always visible, click to expand */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "var(--space-4) var(--space-5)",
          cursor: "pointer",
          borderBottom: isExpanded ? "1px solid var(--color-border)" : "none",
          transition: "background var(--duration-fast)",
          background: isExpanded
            ? "var(--color-surface-2)"
            : "var(--color-surface)",
        }}
      >
        {/* Expand indicator */}
        <span
          style={{
            color: "var(--color-primary)",
            fontSize: "0.8rem",
            flexShrink: 0,
            transition: "transform var(--duration-base)",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
          }}
        >
          ▼
        </span>

        {/* Store icon + name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                fontSize: "var(--text-base)",
                color: "var(--color-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {parent.merchant ?? parent.description}
            </p>
            <Badge variant="muted">{items.length} items</Badge>
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--space-2)",
              marginTop: "var(--space-1)",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {parent.date}
            </span>
            {!isExpanded &&
              topCategories.map((cat) => (
                <span
                  key={cat}
                  style={{ fontSize: "0.75rem" }}
                  title={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
                >
                  {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}
                </span>
              ))}
          </div>
        </div>

        {/* Total + link */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexShrink: 0,
          }}
        >
          <div style={{ textAlign: "right" }}>
            <Amount value={bankAmount.toFixed(2)} type="debit" size="md" />
            {saved > 0.01 && (
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-success)",
                  fontFamily: "var(--font-mono)",
                  marginTop: "2px",
                }}
              >
                saved €{saved.toFixed(2)}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewTransaction();
            }}
            title="View bank transaction"
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--color-text-3)",
              cursor: "pointer",
              fontSize: "var(--text-xs)",
              padding: "2px 8px",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Expanded items */}
      {isExpanded && (
        <div>
          {/* Per-card search when many items */}
          {items.length > 6 && (
            <div
              style={{
                padding: "var(--space-3) var(--space-5)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <input
                value={search}
                onChange={(e) => {
                  e.stopPropagation();
                  setSearch(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Filter items…"
                style={{
                  width: "100%",
                  padding: "var(--space-2) var(--space-3)",
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  outline: "none",
                }}
              />
            </div>
          )}

          {filteredItems.map((item, i) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px 90px",
                alignItems: "center",
                padding: "var(--space-3) var(--space-5)",
                borderBottom:
                  i < filteredItems.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text)",
                }}
              >
                {item.description}
              </p>
              <Badge variant="muted" style={{ justifySelf: "start" }}>
                {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
              </Badge>
              <div style={{ textAlign: "right" }}>
                <Amount value={item.amount} type="debit" size="sm" />
              </div>
            </div>
          ))}

          {/* Summary row */}
          <div
            style={{
              padding: "var(--space-3) var(--space-5)",
              background: "var(--color-surface-2)",
              borderTop: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                fontWeight: 600,
              }}
            >
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-4)",
              }}
            >
              {saved > 0.01 && !search && (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-success)",
                  }}
                >
                  items €{itemsTotal.toFixed(2)} · saved €{saved.toFixed(2)}
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                  }}
                >
                  paid
                </span>
                <Amount value={bankAmount.toFixed(2)} type="debit" size="sm" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
