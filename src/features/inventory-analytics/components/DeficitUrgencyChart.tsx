import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { PredictedDeficit } from "../types";
import { URGENCY_CONFIG, URGENCY_CHART_COLORS } from "../lib/urgencyConfig";
import styles from "../styles/InventoryAnalytics.module.css";

interface DeficitUrgencyChartProps {
  deficits: PredictedDeficit[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const ChartTooltip: React.FC<TooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipLabel}>{payload[0].name}</span>
      <span className={styles.chartTooltipValue}>{payload[0].value} items</span>
    </div>
  );
};

export const DeficitUrgencyChart: React.FC<DeficitUrgencyChartProps> = ({
  deficits,
}) => {
  const counts = deficits.reduce<Record<string, number>>((acc, d) => {
    acc[d.urgency] = (acc[d.urgency] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(URGENCY_CONFIG)
    .filter(([level]) => counts[level] > 0)
    .map(([level, config]) => ({
      name: config.label,
      value: counts[level],
      color: URGENCY_CHART_COLORS[level as PredictedDeficit["urgency"]],
    }));

  if (chartData.length === 0) {
    return (
      <div className={styles.panelCard}>
        <h2 className={styles.panelTitle}>Deficit urgency breakdown</h2>
        <div className={styles.panelEmpty}>No deficits to chart</div>
      </div>
    );
  }

  return (
    <div className={styles.panelCard}>
      <h2 className={styles.panelTitle}>Deficit urgency breakdown</h2>
      <p className={styles.panelSubtitle}>{deficits.length} total deficits</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={48}
            outerRadius={72}
            paddingAngle={3}
            strokeWidth={0}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className={styles.donutLegend}>
        {chartData.map((entry) => (
          <div key={entry.name} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: entry.color }}
            />
            <span className={styles.legendLabel}>
              {entry.name} ({entry.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
