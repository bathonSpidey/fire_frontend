import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "../api/transactions";
import { useActiveUser } from "../store/useUserStore";
import { PageHeader } from "../components/layouts/PageHeader";
import {
  KpiCard,
  DonutChart,
  SavingsRateBar,
  Bar,
} from "../components/dashboard/DashboardCharts";
import {
  FirePanel,
  SavingsTrendPanel,
} from "../components/dashboard/FirePanel";
import {
  computeMonthly,
  last6Months,
  monthLabel,
  savingsRate,
  fireYears,
} from "../components/dashboard/DashboardHelpers";
import { BalancePanel } from "../components/dashboard/BalancePanel";

export function DashboardPage() {
  const user = useActiveUser();
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const months = last6Months();

  const { data: allTransactions = [], isLoading } = useQuery({
    queryKey: ["transactions-all", user?.id],
    queryFn: () => transactionsApi.list(user!.id),
    enabled: !!user,
    staleTime: 60_000,
  });

  const current = useMemo(
    () => computeMonthly(allTransactions, currentMonth),
    [allTransactions, currentMonth],
  );
  const prev = useMemo(
    () => computeMonthly(allTransactions, months[months.length - 2]),
    [allTransactions, months],
  );
  const trend = useMemo(
    () =>
      months.map((m) => ({
        month: m,
        label: monthLabel(m),
        ...computeMonthly(allTransactions, m),
      })),
    [allTransactions, months],
  );

  const avgSavings = trend.reduce((s, m) => s + m.savings, 0) / trend.length;
  const avgExpenses = trend.reduce((s, m) => s + m.expenses, 0) / trend.length;
  const sr = savingsRate(current.income, current.savings);
  const maxBarValue = Math.max(
    ...trend.map((m) => Math.max(m.income, m.expenses)),
    1,
  );

  const topCategories = useMemo(
    () =>
      Object.entries(current.byCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    [current.byCategory],
  );

  const recentTxs = useMemo(
    () =>
      allTransactions
        .filter(
          (t) =>
            !t.is_receipt_item &&
            !t.is_investment_item &&
            t.transaction_type !== "transfer",
        )
        .slice(0, 8),
    [allTransactions],
  );

  if (isLoading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "var(--space-3)",
        }}
      >
        <span
          style={{
            color: "var(--color-text-3)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
          }}
        >
          LOADING…
        </span>
      </div>
    );

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}
    >
      <PageHeader
        title="Dashboard"
        subtitle={`${now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })} · ${user?.name}`}
      />

      <div
        style={{
          padding: "var(--space-6) var(--space-8) var(--space-12)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-5)",
        }}
      >
        {/* Row 1 — KPI strip */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "var(--space-4)",
          }}
        >
          <KpiCard
            label="INCOME"
            value={current.income}
            prev={prev.income}
            accent="var(--color-success)"
          />
          <KpiCard
            label="EXPENSES"
            value={current.expenses}
            prev={prev.expenses}
            accent="var(--color-danger)"
            invertDelta
          />
          <KpiCard
            label="NET SAVINGS"
            value={current.savings}
            prev={prev.savings}
            accent={
              current.savings >= 0
                ? "var(--color-success)"
                : "var(--color-danger)"
            }
          />
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderLeft: "3px solid var(--color-primary)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
            }}
          >
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                marginBottom: "var(--space-2)",
              }}
            >
              SAVINGS RATE
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-3xl)",
                fontWeight: 700,
                color: "var(--color-primary)",
                lineHeight: 1,
              }}
            >
              {sr.toFixed(1)}%
            </p>
            <SavingsRateBar rate={sr} />
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                marginTop: "var(--space-2)",
              }}
            >
              {sr >= 50
                ? "🚀 FIRE pace"
                : sr >= 20
                  ? "✅ healthy"
                  : "⚠️ below target"}
            </p>
          </div>
        </div>

        {/* Row 2 — Bar chart + Donut */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "var(--space-5)",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                  }}
                >
                  6-MONTH OVERVIEW
                </p>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-2)",
                    marginTop: 2,
                  }}
                >
                  Income · Expenses · Savings
                </p>
              </div>
              <div style={{ display: "flex", gap: "var(--space-4)" }}>
                {[
                  ["var(--color-success)", "Income"],
                  ["var(--color-danger)", "Expenses"],
                  ["var(--color-primary)", "Savings"],
                ].map(([c, l]) => (
                  <div
                    key={l}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-1)",
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: c,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-3)",
                      }}
                    >
                      {l}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: "var(--space-3)",
                alignItems: "flex-end",
                height: 160,
              }}
            >
              {trend.map((m) => (
                <div
                  key={m.month}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 2,
                      width: "100%",
                    }}
                  >
                    <Bar
                      value={m.income}
                      max={maxBarValue}
                      color="var(--color-success)"
                    />
                    <Bar
                      value={m.expenses}
                      max={maxBarValue}
                      color="var(--color-danger)"
                    />
                    <Bar
                      value={Math.max(0, m.savings)}
                      max={maxBarValue}
                      color="var(--color-primary)"
                    />
                  </div>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
            }}
          >
            <p
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--color-text-3)",
                fontWeight: 600,
                letterSpacing: "0.1em",
                marginBottom: "var(--space-4)",
              }}
            >
              SPENDING BREAKDOWN
            </p>
            {topCategories.length === 0 ? (
              <p
                style={{
                  color: "var(--color-text-3)",
                  fontSize: "var(--text-sm)",
                  textAlign: "center",
                }}
              >
                No expense data
              </p>
            ) : (
              <DonutChart categories={topCategories} total={current.expenses} />
            )}
          </div>
        </div>

        {/* Row 3 — FIRE + Savings trend + Recent */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr 1fr 260px",
            gap: "var(--space-4)",
          }}
        >
          <FirePanel
            avgSavings={avgSavings}
            avgExpenses={avgExpenses}
            fireEstimate={fireYears(avgSavings, avgExpenses)}
          />
          <SavingsTrendPanel trend={trend} currentMonth={currentMonth} />
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "var(--space-4)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-3)",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                }}
              >
                RECENT ACTIVITY
              </p>
              <button
                onClick={() => navigate("/transactions")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-primary)",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-body)",
                }}
              >
                View all →
              </button>
            </div>
            {recentTxs.map((tx, i) => (
              <div
                key={tx.id}
                onClick={() => navigate(`/transactions/${tx.id}`)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "var(--space-2) 0",
                  borderBottom:
                    i < recentTxs.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                  cursor: "pointer",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tx.description}
                  </p>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-text-3)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {tx.date}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--text-xs)",
                    flexShrink: 0,
                    marginLeft: "var(--space-2)",
                    color:
                      tx.transaction_type === "credit"
                        ? "var(--color-success)"
                        : "var(--color-danger)",
                  }}
                >
                  {tx.transaction_type === "credit" ? "+" : "-"}€
                  {parseFloat(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <BalancePanel userId={user!.id} />
        </div>
      </div>
    </div>
  );
}
