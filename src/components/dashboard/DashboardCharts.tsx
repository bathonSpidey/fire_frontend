import { CATEGORY_COLORS } from "./DashboardHelpers";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "../../types/api";

export function Bar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div
      style={{
        flex: 1,
        height: `${Math.max(2, pct)}%`,
        background: color,
        borderRadius: "2px 2px 0 0",
        opacity: 0.85,
        minHeight: 2,
        transition: "height 0.4s ease",
      }}
    />
  );
}

export function DonutChart({
  categories,
  total,
}: {
  categories: [string, number][];
  total: number;
}) {
  const size = 100,
    cx = 50,
    cy = 50,
    r = 38,
    stroke = 12;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  const segments = categories.map(([cat, amt]) => {
    const pct = total > 0 ? amt / total : 0;
    const dash = pct * circumference;
    const offset = circumference - cumulative * circumference;
    cumulative += pct;
    return { cat, dash, gap: circumference - dash, offset };
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          {segments.map(({ cat, dash, gap, offset }) => (
            <circle
              key={cat}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={CATEGORY_COLORS[cat] ?? "#475569"}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "50% 50%",
              }}
            />
          ))}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fill="var(--color-text)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fontWeight="700"
          >
            €{total.toFixed(0)}
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fill="var(--color-text-3)"
            fontSize="7"
            fontFamily="var(--font-mono)"
          >
            TOTAL
          </text>
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
          marginTop: "var(--space-3)",
        }}
      >
        {categories.map(([cat, amt]) => (
          <div
            key={cat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                flexShrink: 0,
                background: CATEGORY_COLORS[cat] ?? "#475569",
              }}
            />
            <span
              style={{
                flex: 1,
                fontSize: "var(--text-xs)",
                color: "var(--color-text-2)",
              }}
            >
              {CATEGORY_ICONS[cat as keyof typeof CATEGORY_ICONS]}{" "}
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text)",
              }}
            >
              €{amt.toFixed(0)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "var(--color-text-3)",
                width: 36,
                textAlign: "right",
              }}
            >
              {total > 0 ? ((amt / total) * 100).toFixed(0) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SavingsRateBar({ rate }: { rate: number }) {
  const color =
    rate >= 50
      ? "var(--color-primary)"
      : rate >= 20
        ? "var(--color-success)"
        : "var(--color-danger)";
  return (
    <div style={{ marginTop: "var(--space-3)" }}>
      <div
        style={{
          position: "relative",
          height: 6,
          background: "var(--color-border)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${rate}%`,
            background: color,
            borderRadius: 3,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        {[10, 20, 30, 50].map((m) => (
          <span
            key={m}
            style={{
              fontSize: "9px",
              color: rate >= m ? "var(--color-primary)" : "var(--color-text-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {m}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  prev,
  accent,
  invertDelta = false,
}: {
  label: string;
  value: number;
  prev: number;
  accent: string;
  invertDelta?: boolean;
}) {
  const delta = prev > 0 ? ((value - prev) / prev) * 100 : 0;
  const isGood = invertDelta ? delta < 0 : delta > 0;
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderLeft: `3px solid ${accent}`,
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
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-3xl)",
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
        }}
      >
        €{value.toFixed(0)}
      </p>
      {prev > 0 && (
        <p
          style={{
            fontSize: "10px",
            color: isGood ? "var(--color-success)" : "var(--color-danger)",
            fontFamily: "var(--font-mono)",
            marginTop: "var(--space-2)",
          }}
        >
          {isGood ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs last month
        </p>
      )}
    </div>
  );
}
