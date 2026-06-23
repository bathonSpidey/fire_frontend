import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatEuro, formatCategoryLabel } from "../lib/formatters";
import styles from "../styles/InventoryAnalytics.module.css";

interface LeakageCategoryChartProps {
  breakdown: Record<string, number>;
  totalWasted: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipLabel}>{label}</span>
      <span className={styles.chartTooltipValue}>
        {formatEuro(payload[0].value)}
      </span>
    </div>
  );
};

export const LeakageCategoryChart: React.FC<LeakageCategoryChartProps> = ({
  breakdown,
  totalWasted,
}) => {
  const chartData = Object.entries(breakdown)
    .map(([key, value]) => ({ name: formatCategoryLabel(key), value }))
    .sort((a, b) => b.value - a.value);

  if (chartData.length === 0) {
    return <div className={styles.panelEmpty}>No leakage data available</div>;
  }

  return (
    <div className={styles.panelCard}>
      <div className={styles.panelHeaderRow}>
        <div>
          <h2 className={styles.panelTitle}>Capital leakage by category</h2>
          <p className={styles.panelSubtitle}>
            Total wasted: {formatEuro(totalWasted)}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 4 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--text-secondary)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}€`}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ fill: "var(--surface-raised)" }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {chartData.map((_, i) => (
              <Cell
                key={i}
                fill={
                  i === 0 ? "var(--danger)" : "var(--warning-text, #e6a23c)"
                }
                fillOpacity={1 - i * 0.12}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
