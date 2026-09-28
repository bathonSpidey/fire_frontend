import React from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { Chart } from "../types";
import styles from "../styles/Insights.module.css";

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6", "#f97316", "#ec4899", "#84cc16"];
const AXIS = { fill: "var(--text-secondary)", fontSize: 12 };

const euro = (value: number): string => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export const ChartRenderer: React.FC<{ chart: Chart }> = ({ chart }) => {
  if (chart.points.length === 0) return null;

  if (chart.type === "table") {
    return (
      <div className={styles.chartCard}>
        <h4 className={styles.chartTitle}>{chart.title}</h4>
        <table className={styles.chartTable}>
          <tbody>
            {chart.points.map((p) => (
              <tr key={p.label}>
                <td>{p.label}</td>
                <td className={styles.chartValue}>{euro(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const data = chart.points.map((p) => ({ name: p.label, value: p.value }));

  return (
    <div className={styles.chartCard}>
      <h4 className={styles.chartTitle}>{chart.title}</h4>
      <ResponsiveContainer width="100%" height={220}>
        {chart.type === "line" ? (
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={AXIS} stroke="var(--border)" />
            <YAxis tick={AXIS} stroke="var(--border)" width={56} />
            <Tooltip formatter={(v: unknown) => euro(Number(v) || 0)} contentStyle={{ background: "var(--surface-raised)", border: "0.5px solid var(--border)" }} />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot />
          </LineChart>
        ) : chart.type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label={(e) => e.name}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: unknown) => euro(Number(v) || 0)} contentStyle={{ background: "var(--surface-raised)", border: "0.5px solid var(--border)" }} />
          </PieChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={AXIS} stroke="var(--border)" />
            <YAxis tick={AXIS} stroke="var(--border)" width={56} />
            <Tooltip formatter={(v: unknown) => euro(Number(v) || 0)} contentStyle={{ background: "var(--surface-raised)", border: "0.5px solid var(--border)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
