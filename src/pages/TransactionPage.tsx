import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { useActiveUser } from "../store/useUserStore";
import { PageHeader } from "../components/layouts/PageHeader";
import { MonthPicker } from "../components/transactions/MonthPicker";
import {
  TransactionFilters,
  type Filters,
} from "../components/transactions/TransactionFilters";
import { TransactionTable } from "../components/transactions/TransactionTable";
import { Amount } from "../components/ui/Amount";
import { Card } from "../components/ui/Card";
import { LoadingSpinner, ErrorMessage } from "../components/ui/Feedback";
import type { MonthYear } from "../types/api";

export function TransactionsPage() {
  const user = useActiveUser();
  const now = new Date();

  const [period, setPeriod] = useState<MonthYear>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const [filters, setFilters] = useState<Filters>({
    type: "all",
    category: "all",
  });

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transactions", user?.id, period.year, period.month],
    queryFn: () => transactionsApi.list(user!.id, period.year, period.month),
    enabled: !!user,
  });

  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    // Exclude receipt items — their parent bank transaction already counts
    for (const tx of transactions.filter((t) => !t.is_receipt_item)) {
      const amt = parseFloat(tx.amount);
      if (tx.transaction_type === "credit") income += amt;
      else expenses += amt;
    }
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  const counts = {
    income: transactions.filter((t) => t.transaction_type === "credit").length,
    expense: transactions.filter((t) => t.transaction_type === "debit").length,
  };

  return (
    // Outer: fills the AppShell <main> which is already overflow:auto
    // We use flexbox column so the table section can grow and scroll naturally
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%", // fills the scrollable <main>
      }}
    >
      <PageHeader
        title="Transactions"
        subtitle={`${transactions.length} transaction${transactions.length !== 1 ? "s" : ""}`}
        action={<MonthPicker value={period} onChange={setPeriod} />}
      />

      {/* Scrollable content — grows naturally, no fixed height */}
      <div
        style={{
          padding: "var(--space-6) var(--space-8) var(--space-12)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {/* Summary cards */}
        {transactions.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-4)",
            }}
          >
            <SummaryCard label="Income" value={summary.income} type="credit" />
            <SummaryCard
              label="Expenses"
              value={summary.expenses}
              type="debit"
            />
            <SummaryCard
              label="Net savings"
              value={Math.abs(summary.net)}
              type={summary.net >= 0 ? "credit" : "debit"}
              prefix={summary.net >= 0 ? "+" : "-"}
            />
          </div>
        )}

        {/* Filters */}
        <TransactionFilters
          filters={filters}
          onChange={setFilters}
          counts={counts}
        />

        {/* Table */}
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
        ) : error ? (
          <ErrorMessage message="Failed to load transactions." />
        ) : (
          <TransactionTable
            transactions={transactions}
            displayFilters={filters}
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  type,
  prefix = "",
}: {
  label: string;
  value: number;
  type: "credit" | "debit";
  prefix?: string;
}) {
  const accentColor =
    type === "credit" ? "var(--color-success)" : "var(--color-danger)";

  return (
    <Card accent style={{ borderLeftColor: accentColor }}>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-3)",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "var(--space-2)",
        }}
      >
        {label}
      </p>
      <Amount value={prefix + value.toFixed(2)} type={type} size="xl" />
    </Card>
  );
}
