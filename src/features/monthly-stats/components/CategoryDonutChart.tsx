import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { formatEuro } from "../lib/statsCalculation";
import styles from "../styles/MonthlyStats.module.css";
import {
  formatCategoryLabel,
  type NamedCategoryStat,
} from "../lib/categoryGrouping";

interface CategoryDonutChartProps {
  categories: NamedCategoryStat[];
}

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
  "#14b8a6",
  "#f97316",
];

interface TooltipPayloadEntry {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}

const ChartTooltip: React.FC<CustomTooltipProps> = (props) => {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;

  const entry = payload[0];
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipLabel}>{entry.name}</span>
      <span className={styles.chartTooltipValue}>
        {formatEuro(entry.value)}
      </span>
    </div>
  );
};

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
}) => {
  const chartData = categories.map((c) => ({
    name: formatCategoryLabel(c.name),
    value: c.total,
  }));

  if (chartData.length === 0) return null;

  return (
    <div className={styles.donutWrapper}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            strokeWidth={0}
          >
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className={styles.donutLegend}>
        {chartData.slice(0, 6).map((entry, index) => (
          <div key={entry.name} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <span className={styles.legendLabel}>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
