import type { TransactionCategory, TransactionType } from "../../types/api";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../../types/api";

export interface Filters {
  type: TransactionType | "all";
  category: TransactionCategory | "all";
}

interface TransactionFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  counts: { income: number; expense: number };
}

export function TransactionFilters({
  filters,
  onChange,
  counts,
}: TransactionFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-3)",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      {/* Type toggle */}
      <div
        style={{
          display: "flex",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "2px",
          gap: "2px",
        }}
      >
        {(
          [
            { value: "all", label: "All" },
            { value: "credit", label: `Income (${counts.income})` },
            { value: "debit", label: `Expenses (${counts.expense})` },
          ] as const
        ).map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, type: opt.value })}
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background:
                filters.type === opt.value
                  ? "var(--color-surface-2)"
                  : "transparent",
              color:
                filters.type === opt.value
                  ? "var(--color-text)"
                  : "var(--color-text-3)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: filters.type === opt.value ? 600 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all var(--duration-fast)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category dropdown */}
      <select
        value={filters.category}
        onChange={(e) =>
          onChange({
            ...filters,
            category: e.target.value as TransactionCategory | "all",
          })
        }
        style={{
          padding: "4px 10px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text-2)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-xs)",
          cursor: "pointer",
          outline: "none",
          height: "32px",
        }}
      >
        <option value="all">All categories</option>
        {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map((cat) => (
          <option key={cat} value={cat}>
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
          </option>
        ))}
      </select>
    </div>
  );
}
