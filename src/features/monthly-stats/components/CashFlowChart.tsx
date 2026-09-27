import React from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MonthlyStatsResponse } from "../types";
import { formatEuro } from "../lib/statsCalculation";
import styles from "../styles/MonthlyStats.module.css";

// Semantic roles, not interchangeable categories: income arriving, spent on living, moved into
// investments, and what is simply left over. Colors match how income/expense are already shown
// elsewhere on this page, plus a blue for "invested" that matches the Investments page's own accent.
const INCOME_COLOR = "var(--ai-purple)";
const LIFESTYLE_COLOR = "var(--primary)";
const INVESTED_COLOR = "#2a78d6";
const POSITIVE_COLOR = "var(--success-text)";
const NEGATIVE_COLOR = "var(--danger-text)";

interface Row {
  step: string;
  base: number;
  range: number;
  display: number; // the signed value shown as this bar's label
  color: string;
  note: string;
}

// A transition from `start` to `end`: an invisible base (the lower of the two) and a visible range
// on top of it, the classic trick for a floating "waterfall" segment out of a plain stacked bar.
const segment = (start: number, end: number): { base: number; range: number } => ({
  base: Math.min(start, end),
  range: Math.abs(end - start),
});

interface TipPayload {
  payload?: Row;
}

const Tip: React.FC<{ active?: boolean; payload?: TipPayload[] }> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  if (!row) return null;
  return (
    <div className={styles.chartTooltip}>
      <span className={styles.chartTooltipLabel}>{row.step}</span>
      <span className={styles.chartTooltipValue}>{formatEuro(row.display, true)}</span>
      <span className={styles.chartTooltipLabel}>{row.note}</span>
    </div>
  );
};

const AXIS = { fill: "var(--text-secondary)", fontSize: 12 };
const euroShort = (value: number): string => `${Math.round(value).toLocaleString("de-DE")} €`;

export const CashFlowChart: React.FC<{ stats: MonthlyStatsResponse }> = ({ stats }) => {
  const { gross_income: income, lifestyle_expenses: lifestyle, total_invested: invested } = stats;
  const afterLifestyle = income - lifestyle;
  const leftover = afterLifestyle - invested;

  // Recharts stacks positive and negative values on their own sides of zero rather than running one
  // total through them, so a floating segment breaks the moment the flow dips below zero (as a month
  // that overspent does). Shifting every bar up by however far the flow dips keeps every "base" at or
  // above zero, where the stacking trick works; the axis ticks and the reference line below are then
  // shifted back down by the same amount, so the chart still reads in real euros.
  const points = [0, income, afterLifestyle, leftover];
  const offset = Math.min(...points);
  const lift = (row: { base: number; range: number }) => ({ ...row, base: row.base - offset });

  const data: Row[] = [
    { step: "Income", ...lift(segment(0, income)), display: income, color: INCOME_COLOR, note: "Money that arrived this month" },
    {
      step: "Lifestyle", ...lift(segment(income, afterLifestyle)), display: -lifestyle, color: LIFESTYLE_COLOR,
      note: "Spent on living",
    },
    {
      step: "Invested", ...lift(segment(afterLifestyle, leftover)), display: -invested, color: INVESTED_COLOR,
      note: invested >= 0 ? "Moved into investments" : "Came back from a sale",
    },
    {
      step: "Leftover", ...lift(segment(0, leftover)), display: leftover, color: leftover >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
      note: "Neither spent nor invested — just sitting",
    },
  ];

  if (income === 0 && lifestyle === 0 && invested === 0) return null;

  return (
    <div className={styles.metaCard}>
      <h3 className={styles.sectionTitle}>Where the month's money went</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="step" tickLine={false} axisLine={{ stroke: "var(--border)" }} tick={AXIS} />
          <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={(v: number) => euroShort(v + offset)} tick={AXIS} />
          <Tooltip content={<Tip />} cursor={{ fill: "var(--surface-raised)" }} />
          <ReferenceLine y={-offset} stroke="var(--border)" />
          <Bar dataKey="base" stackId="flow" fill="transparent" maxBarSize={24} isAnimationActive={false} />
          <Bar dataKey="range" stackId="flow" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.step} fill={row.color} />
            ))}
            <LabelList
              dataKey="display"
              position="top"
              formatter={(value: unknown) => formatEuro(Number(value), true)}
              style={{ fill: "var(--text-primary)", fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <span className={styles.trendCaption}>
        Income in, then what was spent on living and what was moved into investments — the last bar is what is left,
        neither spent nor invested.
      </span>
    </div>
  );
};
