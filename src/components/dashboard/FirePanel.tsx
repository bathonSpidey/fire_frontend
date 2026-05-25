import { savingsRate } from "./DashboardHelpers";

interface MonthData {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

export function FirePanel({
  avgSavings,
  avgExpenses,
  fireEstimate,
}: {
  avgSavings: number;
  avgExpenses: number;
  fireEstimate: number | null;
}) {
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
        gap: "var(--space-4)",
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
        FIRE PROJECTION
      </p>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-4xl)",
            fontWeight: 700,
            color: "var(--color-primary)",
            lineHeight: 1,
          }}
        >
          {fireEstimate ?? "—"}
        </p>
        <p
          style={{
            fontSize: "var(--text-sm)",
            color: "var(--color-text-3)",
            marginTop: "var(--space-1)",
          }}
        >
          years to FI
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <MetricRow
          label="Avg monthly savings"
          value={`€${avgSavings.toFixed(0)}`}
        />
        <MetricRow
          label="Avg monthly expenses"
          value={`€${avgExpenses.toFixed(0)}`}
        />
        <MetricRow
          label="FI target (25×)"
          value={`€${(avgExpenses * 12 * 25).toFixed(0)}`}
          accent
        />
      </div>
      <p
        style={{
          fontSize: "10px",
          color: "var(--color-text-3)",
          lineHeight: 1.4,
        }}
      >
        Based on 4% rule, 6-month avg. No investment returns assumed.
      </p>
    </div>
  );
}

function MetricRow({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: "11px", color: "var(--color-text-3)" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: accent ? "var(--color-primary)" : "var(--color-text)",
          fontWeight: accent ? 700 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function SavingsTrendPanel({
  trend,
  currentMonth,
}: {
  trend: MonthData[];
  currentMonth: string;
}) {
  const avgRate =
    trend.reduce((s, m) => s + savingsRate(m.income, m.savings), 0) /
    trend.length;

  return (
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
        SAVINGS RATE TREND
      </p>
      <div
        style={{
          display: "flex",
          gap: "var(--space-3)",
          alignItems: "flex-end",
          height: 100,
        }}
      >
        {trend.map((m) => {
          const rate = savingsRate(m.income, m.savings);
          const isActive = m.month === currentMonth;
          return (
            <div
              key={m.month}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-text-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {rate.toFixed(0)}%
              </span>
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(4, rate)}px`,
                  maxHeight: 80,
                  background: isActive
                    ? "var(--color-primary)"
                    : rate >= 20
                      ? "var(--color-success)"
                      : "var(--color-danger)",
                  borderRadius: "3px 3px 0 0",
                  opacity: isActive ? 1 : 0.6,
                  transition: "height 0.4s ease",
                }}
              />
              <span
                style={{
                  fontSize: "10px",
                  color: isActive
                    ? "var(--color-primary)"
                    : "var(--color-text-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: "var(--space-3)",
          paddingTop: "var(--space-3)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{ fontSize: "var(--text-xs)", color: "var(--color-text-3)" }}
        >
          6-month avg
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          {avgRate.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
