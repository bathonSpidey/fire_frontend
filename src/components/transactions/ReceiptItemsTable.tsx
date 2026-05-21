import { useState, useMemo } from "react";
import type { Transaction } from "../../types/api";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../../types/api";
import { Amount } from "../ui/Amount";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/Feedback";

interface ReceiptItemsTableProps {
  items: Transaction[];
}

export function ReceiptItemsTable({ items }: ReceiptItemsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "description">(
    "description",
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items
      .filter(
        (item) =>
          !q ||
          item.description.toLowerCase().includes(q) ||
          (item.merchant?.toLowerCase().includes(q) ?? false) ||
          CATEGORY_LABELS[item.category].toLowerCase().includes(q),
      )
      .sort((a, b) => {
        if (sortBy === "amount")
          return parseFloat(b.amount) - parseFloat(a.amount);
        if (sortBy === "date") return b.date.localeCompare(a.date);
        return a.description.localeCompare(b.description);
      });
  }, [items, search, sortBy]);

  const total = items.reduce((sum, i) => sum + parseFloat(i.amount), 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}
    >
      {/* Search + sort bar */}
      <div
        style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          style={{
            flex: 1,
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
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
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-2)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="description">Sort: Name</option>
          <option value="amount">Sort: Amount</option>
          <option value="date">Sort: Date</option>
        </select>
        <span
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-text-3)",
            whiteSpace: "nowrap",
          }}
        >
          {filtered.length} of {items.length} items
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No items match"
          description="Try a different search term."
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
              gridTemplateColumns: "1fr 140px 100px",
              padding: "var(--space-2) var(--space-4)",
              background: "var(--color-surface-2)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            {["Item", "Category", "Amount"].map((h) => (
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
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 100px",
                alignItems: "center",
                padding: "var(--space-3) var(--space-4)",
                borderBottom:
                  i < filtered.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
                background: "var(--color-surface)",
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
                {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
              </Badge>
              <div style={{ textAlign: "right" }}>
                <Amount value={item.amount} type="debit" size="sm" />
              </div>
            </div>
          ))}

          {/* Total row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 140px 100px",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--color-surface-2)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                color: "var(--color-text-2)",
              }}
            >
              Total ({items.length} items)
            </span>
            <span />
            <div style={{ textAlign: "right" }}>
              <Amount value={total.toFixed(2)} type="debit" size="sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
