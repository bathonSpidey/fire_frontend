import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { useActiveUser } from "../store/useUserStore";
import { PageHeader } from "../components/layouts/PageHeader";
import { Amount } from "../components/ui/Amount";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner, EmptyState } from "../components/ui/Feedback";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types/api";
import type { TransactionCategory } from "../types/api";

export function ItemsPage() {
  const user = useActiveUser();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<TransactionCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">(
    "date",
  );

  const { data: allTransactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => transactionsApi.list(user!.id),
    enabled: !!user,
  });

  // Only receipt line items
  const receiptItems = allTransactions.filter((tx) => tx.is_receipt_item);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return receiptItems
      .filter((tx) => {
        if (category !== "all" && tx.category !== category) return false;
        if (!q) return true;
        return (
          tx.description.toLowerCase().includes(q) ||
          (tx.merchant?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => {
        if (sortBy === "amount")
          return parseFloat(b.amount) - parseFloat(a.amount);
        if (sortBy === "date") return b.date.localeCompare(a.date);
        return a.description.localeCompare(b.description);
      });
  }, [receiptItems, search, category, sortBy]);

  // Category counts for filter
  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<TransactionCategory, number>> = {};
    for (const tx of receiptItems) {
      counts[tx.category] = (counts[tx.category] ?? 0) + 1;
    }
    return counts;
  }, [receiptItems]);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <PageHeader
        title="Items"
        subtitle={`${receiptItems.length} receipt items across all purchases`}
      />

      <div
        style={{
          padding: "var(--space-6) var(--space-8) var(--space-12)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {/* Search + filters */}
        <div
          style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, e.g. 'banana', 'shampoo'…"
            autoFocus
            style={{
              flex: 1,
              minWidth: "200px",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
            }}
          />
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as TransactionCategory | "all")
            }
            style={{
              padding: "var(--space-2) var(--space-3)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-2)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="all">All categories</option>
            {(Object.entries(categoryCounts) as [TransactionCategory, number][])
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <option key={cat} value={cat}>
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]} ({count})
                </option>
              ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            style={{
              padding: "var(--space-2) var(--space-3)",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-2)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="date">Sort: Newest</option>
            <option value="amount">Sort: Amount</option>
            <option value="description">Sort: Name</option>
          </select>
        </div>

        {/* Results count */}
        {search && (
          <p
            style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}
          >
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
            {search}"
          </p>
        )}

        {/* Content */}
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
        ) : receiptItems.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No receipt items yet"
            description="Attach receipts to your bank transactions to build your purchase history."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No results"
            description={`Nothing matches "${search}"`}
          />
        ) : (
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
                gridTemplateColumns: "1fr 140px 100px 110px",
                padding: "var(--space-2) var(--space-4)",
                background: "var(--color-surface-2)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              {["Item", "Category", "Amount", "Date"].map((h) => (
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

            {filtered.map((item, i) => (
              <div
                key={item.id}
                onClick={() =>
                  item.parent_transaction_id &&
                  navigate(`/transactions/${item.parent_transaction_id}`)
                }
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 140px 100px 110px",
                  alignItems: "center",
                  padding: "var(--space-3) var(--space-4)",
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                  background: "var(--color-surface)",
                  cursor: item.parent_transaction_id ? "pointer" : undefined,
                  transition: "background var(--duration-fast)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--color-surface-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--color-surface)";
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text)",
                    }}
                  >
                    {item.description}
                  </p>
                  {item.merchant && (
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-3)",
                      }}
                    >
                      {item.merchant}
                    </p>
                  )}
                </div>
                <Badge variant="muted">
                  {CATEGORY_ICONS[item.category]}{" "}
                  {CATEGORY_LABELS[item.category]}
                </Badge>
                <Amount value={item.amount} type="debit" size="sm" />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                  }}
                >
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
