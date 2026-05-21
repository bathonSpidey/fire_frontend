import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { useActiveUser } from "../store/useUserStore";
import { PageHeader } from "../components/layouts/PageHeader";
import { MonthPicker } from "../components/transactions/MonthPicker";
import { Amount } from "../components/ui/Amount";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { LoadingSpinner, EmptyState } from "../components/ui/Feedback";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../types/api";
import type { Transaction, MonthYear } from "../types/api";

export function BanksPage() {
  const user = useActiveUser();
  const navigate = useNavigate();
  const now = new Date();

  const [period, setPeriod] = useState<MonthYear>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Fetch all transactions — we need transfers + their investment transactions
  const { data: allTransactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: () => transactionsApi.list(user!.id),
    enabled: !!user,
  });

  // Group transfer transactions by bank account
  const bankGroups = useMemo(() => {
    const monthStr = `${period.year}-${String(period.month).padStart(2, "0")}`;

    // Transfers in selected month
    const transfers = allTransactions.filter(
      (tx) =>
        tx.transaction_type === "transfer" &&
        tx.transfer_account_name &&
        tx.date.startsWith(monthStr),
    );

    // Investment transactions grouped by document
    const investmentsByDoc = new Map<string, Transaction[]>();
    for (const tx of allTransactions) {
      if (!tx.is_receipt_item && tx.document_id) {
        // Find if this transaction belongs to a transfer document
        const parentTransfer = transfers.find(
          (t) => t.transfer_document_id === tx.document_id,
        );
        if (parentTransfer) {
          const group = investmentsByDoc.get(tx.document_id) ?? [];
          group.push(tx);
          investmentsByDoc.set(tx.document_id, group);
        }
      }
    }

    // Group by account name
    const byBank = new Map<
      string,
      {
        accountName: string;
        transfers: Transaction[];
        transactions: Transaction[];
        totalIn: number;
        totalOut: number;
      }
    >();

    for (const transfer of transfers) {
      const name = transfer.transfer_account_name!;
      const existing = byBank.get(name) ?? {
        accountName: name,
        transfers: [],
        transactions: [],
        totalIn: 0,
        totalOut: 0,
      };
      existing.transfers.push(transfer);

      if (transfer.transfer_document_id) {
        const invTxs =
          investmentsByDoc.get(transfer.transfer_document_id) ?? [];
        existing.transactions.push(...invTxs);
        for (const tx of invTxs) {
          if (tx.transaction_type === "credit")
            existing.totalIn += parseFloat(tx.amount);
          else existing.totalOut += parseFloat(tx.amount);
        }
      }
      byBank.set(name, existing);
    }

    return [...byBank.values()].sort((a, b) =>
      a.accountName.localeCompare(b.accountName),
    );
  }, [allTransactions, period]);

  const totalTransferred = useMemo(
    () =>
      bankGroups.reduce(
        (sum, g) =>
          sum + g.transfers.reduce((s, t) => s + parseFloat(t.amount), 0),
        0,
      ),
    [bankGroups],
  );

  function toggle(name: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <PageHeader
        title="Banks"
        subtitle={`Investment & transfer accounts`}
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
        {/* Summary */}
        {bankGroups.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "var(--space-4)",
            }}
          >
            <Card accent style={{ borderLeftColor: "var(--color-info)" }}>
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
                Transferred
              </p>
              <Amount
                value={totalTransferred.toFixed(2)}
                type="debit"
                size="xl"
              />
            </Card>
            <Card accent style={{ borderLeftColor: "var(--color-primary)" }}>
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
                Accounts
              </p>
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-3xl)",
                  fontWeight: 700,
                  color: "var(--color-primary)",
                }}
              >
                {bankGroups.length}
              </p>
            </Card>
            <Card accent style={{ borderLeftColor: "var(--color-success)" }}>
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
                Investments
              </p>
              <Amount
                value={bankGroups
                  .reduce((s, g) => s + g.totalOut, 0)
                  .toFixed(2)}
                type="debit"
                size="xl"
              />
            </Card>
          </div>
        )}

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
        ) : bankGroups.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="No transfers this month"
            description="Mark a debit transaction as a transfer and attach the investment bank statement to track it here."
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {bankGroups.map((group) => (
              <BankCard
                key={group.accountName}
                group={group}
                isExpanded={expanded.has(group.accountName)}
                onToggle={() => toggle(group.accountName)}
                onViewTransfer={(id) => navigate(`/transactions/${id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bank card ─────────────────────────────────────────────────────────────────

function BankCard({
  group,
  isExpanded,
  onToggle,
  onViewTransfer,
}: {
  group: {
    accountName: string;
    transfers: Transaction[];
    transactions: Transaction[];
    totalIn: number;
    totalOut: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onViewTransfer: (id: string) => void;
}) {
  const transferTotal = group.transfers.reduce(
    (s, t) => s + parseFloat(t.amount),
    0,
  );
  const hasTransactions = group.transactions.length > 0;

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--color-surface)",
      }}
    >
      {/* Header */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          padding: "var(--space-4) var(--space-5)",
          cursor: "pointer",
          borderBottom: isExpanded ? "1px solid var(--color-border)" : "none",
          background: isExpanded
            ? "var(--color-surface-2)"
            : "var(--color-surface)",
          transition: "background var(--duration-fast)",
        }}
      >
        <span
          style={{
            color: "var(--color-info)",
            fontSize: "0.8rem",
            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
            transition: "transform var(--duration-base)",
            flexShrink: 0,
          }}
        >
          ▼
        </span>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>🏦</span>
            <p
              style={{
                fontWeight: 700,
                fontSize: "var(--text-base)",
                color: "var(--color-text)",
              }}
            >
              {group.accountName}
            </p>
            <Badge variant="info">
              {group.transfers.length} transfer
              {group.transfers.length !== 1 ? "s" : ""}
            </Badge>
            {hasTransactions && (
              <Badge variant="default">
                {group.transactions.length} transactions
              </Badge>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              marginTop: "var(--space-1)",
            }}
          >
            {group.transfers.map((t) => (
              <span
                key={t.id}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {t.date}
              </span>
            ))}
          </div>
        </div>

        <Amount value={transferTotal.toFixed(2)} type="debit" size="md" />
      </div>

      {/* Expanded — show transfers + investment transactions */}
      {isExpanded && (
        <div>
          {/* Source transfers */}
          <div
            style={{
              padding: "var(--space-3) var(--space-5)",
              borderBottom: "1px solid var(--color-border)",
              background: "rgba(59,130,246,0.03)",
            }}
          >
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
              Source transfers
            </p>
            {group.transfers.map((t) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-3)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    {t.date}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-2)",
                    }}
                  >
                    {t.description}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--space-3)",
                    alignItems: "center",
                  }}
                >
                  <Amount value={t.amount} type="debit" size="sm" />
                  <button
                    onClick={() => onViewTransfer(t.id)}
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
            ))}
          </div>

          {/* Investment transactions */}
          {hasTransactions ? (
            <div>
              <div
                style={{
                  padding: "var(--space-2) var(--space-5)",
                  background: "var(--color-surface-2)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Investment transactions
                </p>
              </div>
              {group.transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 130px 100px",
                    alignItems: "center",
                    padding: "var(--space-3) var(--space-5)",
                    borderBottom:
                      i < group.transactions.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                    }}
                  >
                    {tx.date}
                  </span>
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
                  <Badge variant="muted">
                    {CATEGORY_ICONS[tx.category]} {CATEGORY_LABELS[tx.category]}
                  </Badge>
                  <div style={{ textAlign: "right" }}>
                    <Amount
                      value={tx.amount}
                      type={tx.transaction_type}
                      size="sm"
                      showSign
                    />
                  </div>
                </div>
              ))}
              {/* Summary */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "var(--space-6)",
                  padding: "var(--space-3) var(--space-5)",
                  background: "var(--color-surface-2)",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                {group.totalIn > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-2)",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-3)",
                      }}
                    >
                      in
                    </span>
                    <Amount
                      value={group.totalIn.toFixed(2)}
                      type="credit"
                      size="sm"
                    />
                  </div>
                )}
                {group.totalOut > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-2)",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-3)",
                      }}
                    >
                      out
                    </span>
                    <Amount
                      value={group.totalOut.toFixed(2)}
                      type="debit"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "var(--space-6)",
                textAlign: "center",
                color: "var(--color-text-3)",
                fontSize: "var(--text-sm)",
              }}
            >
              No statement attached — click 🏦 on the source transfer to attach
              one
            </div>
          )}
        </div>
      )}
    </div>
  );
}
