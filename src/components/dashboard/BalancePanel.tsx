import { useQuery } from "@tanstack/react-query";
import { documentsApi } from "../../api/documents";
import type { BalanceEntry } from "../../api/documents";

function AccountRow({ entry }: { entry: BalanceEntry }) {
  const balance = entry.closing_balance
    ? parseFloat(entry.closing_balance)
    : null;
  const isInvestment = entry.document_type === "investment_statement";
  const icon = isInvestment ? "📈" : "🏦";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-3) 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
      >
        <span style={{ fontSize: "1rem" }}>{icon}</span>
        <div>
          <p
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--color-text)",
              fontWeight: 500,
            }}
          >
            {entry.account_name ?? (isInvestment ? "Investment" : "Bank")}
          </p>
          {entry.statement_date && (
            <p
              style={{
                fontSize: "10px",
                color: "var(--color-text-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              as of {entry.statement_date}
            </p>
          )}
        </div>
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          fontWeight: 700,
          color:
            balance !== null && balance >= 0
              ? "var(--color-success)"
              : "var(--color-danger)",
        }}
      >
        {balance !== null
          ? `€${balance.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`
          : "—"}
      </span>
    </div>
  );
}

export function BalancePanel({ userId }: { userId: string }) {
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["balances", userId],
    queryFn: () => documentsApi.listBalances(userId),
    staleTime: 60_000,
  });

  // Latest balance per account name
  const latest = new Map<string, BalanceEntry>();
  for (const e of entries) {
    const key = e.account_name ?? e.document_type;
    const existing = latest.get(key);
    if (
      !existing ||
      (e.statement_date ?? "") > (existing.statement_date ?? "")
    ) {
      latest.set(key, e);
    }
  }
  const rows = [...latest.values()];
  const netWorth = rows.reduce(
    (s, e) => s + (e.closing_balance ? parseFloat(e.closing_balance) : 0),
    0,
  );

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderLeft: "3px solid var(--color-primary)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-5)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
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
          ACCOUNT BALANCES
        </p>
        {rows.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "10px",
                color: "var(--color-text-3)",
                marginBottom: 2,
              }}
            >
              NET WORTH
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-base)",
                fontWeight: 700,
                color: "var(--color-primary)",
              }}
            >
              €{netWorth.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}>
          Loading…
        </p>
      ) : rows.length === 0 ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-3)" }}>
          Upload bank statements to see balances here.
        </p>
      ) : (
        <div>
          {rows.map((e) => (
            <AccountRow key={e.account_name ?? e.document_type} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
