import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

  // Fetch only transfer transactions — dedicated endpoint, no filtering needed
  const { data: allTransfers = [], isLoading } = useQuery({
    queryKey: ["transfers", user?.id],
    queryFn: () => transactionsApi.listTransfers(user!.id),
    enabled: !!user,
    staleTime: 0,
  });

  // Filter to selected month, only those with a statement attached
  const monthStr = `${period.year}-${String(period.month).padStart(2, "0")}`;
  const transfers = allTransfers.filter((tx) => tx.date.startsWith(monthStr));

  console.log("[BanksPage] allTransfers count:", allTransfers.length);
  console.log(
    "[BanksPage] allTransfers full:",
    JSON.stringify(allTransfers, null, 2),
  );
  console.log("[BanksPage] monthStr:", monthStr);
  console.log("[BanksPage] filtered transfers:", transfers.length);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const totalTransferred = transfers.reduce(
    (s, t) => s + parseFloat(t.amount),
    0,
  );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <PageHeader
        title="Banks"
        subtitle="Investment & transfer accounts"
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
        ) : transfers.length === 0 ? (
          <EmptyState
            icon="🏦"
            title="No transfers this month"
            description="Mark a debit as a transfer and attach the investment bank statement."
          />
        ) : (
          <>
            {/* Summary */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
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
                  {new Set(transfers.map((t) => t.transfer_account_name)).size}
                </p>
              </Card>
            </div>

            {/* One card per transfer */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {transfers.map((transfer) => (
                <TransferCard
                  key={transfer.id}
                  transfer={transfer}
                  isExpanded={expanded.has(transfer.id)}
                  onToggle={() => toggle(transfer.id)}
                  onViewTransfer={() =>
                    navigate(`/transactions/${transfer.id}`)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Single transfer card — fetches its own transactions ───────────────────────

function TransferCard({
  transfer,
  isExpanded,
  onToggle,
  onViewTransfer,
}: {
  transfer: Transaction;
  isExpanded: boolean;
  onToggle: () => void;
  onViewTransfer: () => void;
}) {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transfer-transactions", transfer.id],
      });
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
    },
  });
  // Fetch investment transactions for this specific transfer via dedicated endpoint
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transfer-transactions", transfer.id],
    queryFn: async () => {
      console.log(
        "[TransferCard] fetching transactions for transfer.id:",
        transfer.id,
      );
      console.log(
        "[TransferCard] transfer.transfer_document_id:",
        transfer.transfer_document_id,
      );
      const result = await transactionsApi.getTransferTransactions(transfer.id);
      console.log("[TransferCard] got", result.length, "transactions:", result);
      return result;
    },
    enabled: isExpanded,
    staleTime: 0,
  });

  const totalIn = transactions
    .filter((t) => t.transaction_type === "credit")
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalOut = transactions
    .filter((t) => t.transaction_type === "debit")
    .reduce((s, t) => s + parseFloat(t.amount), 0);

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
            flexShrink: 0,
            transform: isExpanded ? "rotate(180deg)" : "none",
            transition: "transform var(--duration-base)",
          }}
        >
          ▼
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span>🏦</span>
            <p style={{ fontWeight: 700, color: "var(--color-text)" }}>
              {transfer.transfer_account_name ?? "Investment Account"}
            </p>
            <Badge variant="info">statement</Badge>
          </div>
          <div
            style={{
              display: "flex",
              gap: "var(--space-3)",
              marginTop: "var(--space-1)",
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
              {transfer.date}
            </span>
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {transfer.description}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexShrink: 0,
          }}
        >
          <Amount value={transfer.amount} type="debit" size="md" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewTransfer();
            }}
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

      {/* Expanded transactions */}
      {isExpanded && (
        <div>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "var(--space-8)",
              }}
            >
              <LoadingSpinner size={20} />
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                padding: "var(--space-5)",
                textAlign: "center",
                color: "var(--color-text-3)",
                fontSize: "var(--text-sm)",
              }}
            >
              {transfer.transfer_document_id
                ? "No transactions found in statement"
                : "⚠️ Statement not attached — use 🏦 button on the transaction to attach one"}
            </div>
          ) : (
            <div>
              {/* Column header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px 1fr 130px 100px",
                  padding: "var(--space-2) var(--space-5)",
                  background: "var(--color-surface-2)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {["Date", "Description", "Category", "Amount"].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-3)",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 130px 100px",
                    alignItems: "center",
                    padding: "var(--space-3) var(--space-5)",
                    borderBottom:
                      i < transactions.length - 1
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
                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "var(--space-2)",
                    }}
                  >
                    <Amount
                      value={tx.amount}
                      type={tx.transaction_type}
                      size="sm"
                      showSign
                    />
                    <button
                      onClick={() => {
                        if (
                          confirm(`Delete "${tx.description.slice(0, 40)}..."?`)
                        )
                          deleteMutation.mutate(tx.id);
                      }}
                      title="Delete"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-danger)",
                        opacity: 0.5,
                        fontSize: "0.75rem",
                        padding: "0 var(--space-1)",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.5";
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Totals */}
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
                {totalIn > 0 && (
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
                      value={totalIn.toFixed(2)}
                      type="credit"
                      size="sm"
                    />
                  </div>
                )}
                {totalOut > 0 && (
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
                      value={totalOut.toFixed(2)}
                      type="debit"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
