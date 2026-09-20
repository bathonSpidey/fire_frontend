import React from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useTrends } from "../hooks/useTrends";
import type { Mover, Pace, Trends } from "../types";
import styles from "../styles/SpendingViews.module.css";

const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6", "#f97316", "#ec4899", "#84cc16"];

const euro = (value: number): string => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const euroShort = (value: number): string => `${Math.round(value).toLocaleString("de-DE")} €`;

const AXIS = { fill: "var(--text-secondary)", fontSize: 12 };

interface TipPayload {
  name?: string | number;
  value?: number | string;
  color?: string;
}

const Tip: React.FC<{ active?: boolean; payload?: TipPayload[]; label?: string | number; note?: string }> = ({
  active, payload, label, note,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      {payload.map((p) => (
        <span key={String(p.name)} style={{ color: p.color }}>
          {p.name}: {euro(Number(p.value) || 0)}
        </span>
      ))}
      {note && <span className={styles.hint}>{note}</span>}
    </div>
  );
};

const CategoryChart: React.FC<{ trends: Trends; chosen: string[] }> = ({ trends, chosen }) => {
  const labels = new Map(trends.categories.map((c) => [c.key, c.label]));
  const data = trends.months.map((m) => ({
    label: m.label + (m.partial ? " *" : ""),
    partial: m.partial,
    ...Object.fromEntries(chosen.map((k) => [k, m.by_category[k] ?? 0])),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} stroke="var(--border)" />
        <YAxis tick={AXIS} stroke="var(--border)" tickFormatter={euroShort} width={64} />
        <Tooltip content={<Tip note="* month not over yet" />} cursor={{ fill: "var(--surface-raised)" }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        {chosen.map((key, i) => (
          <Bar key={key} dataKey={key} name={labels.get(key) ?? key} fill={PALETTE[i % PALETTE.length]} radius={[4, 4, 0, 0]}>
            {data.map((d, index) => (
              <Cell key={index} fillOpacity={d.partial ? 0.5 : 1} />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const FixedChart: React.FC<{ trends: Trends }> = ({ trends }) => {
  const data = trends.months.map((m) => ({
    label: m.label + (m.partial ? " *" : ""), Fixed: m.fixed, Flexible: m.flexible,
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} stroke="var(--border)" />
        <YAxis tick={AXIS} stroke="var(--border)" tickFormatter={euroShort} width={64} />
        <Tooltip content={<Tip note="* month not over yet" />} cursor={{ fill: "var(--surface-raised)" }} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="Fixed" stackId="a" fill="#6366f1" />
        <Bar dataKey="Flexible" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

const PaceChart: React.FC<{ pace: Pace }> = ({ pace }) => {
  const data = Array.from({ length: pace.days }, (_, i) => ({
    day: i + 1,
    "This month": pace.current[i],
    "Last month": pace.previous[i],
  }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="day" tick={AXIS} stroke="var(--border)" />
        <YAxis tick={AXIS} stroke="var(--border)" tickFormatter={euroShort} width={64} />
        <Tooltip content={<Tip />} />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Line type="stepAfter" dataKey="Last month" stroke="#a1a1aa" strokeWidth={2} dot={false} connectNulls={false} />
        <Line type="stepAfter" dataKey="This month" stroke="#10b981" strokeWidth={3} dot={false} connectNulls={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Movers: React.FC<{ title: string; items: Mover[]; tone: "up" | "down" }> = ({ title, items, tone }) => (
  <div className={styles.card}>
    <h3 className={styles.title}>{title}</h3>
    {items.length === 0 ? (
      <span className={styles.hint}>Nothing moved by more than 10 €.</span>
    ) : (
      items.map((m) => (
        <div key={m.key} className={styles.moverRow}>
          <span>
            {m.label} <span className={styles.hint}>{euro(m.now)} vs {euro(m.average)}</span>
          </span>
          <span className={styles[tone]}>
            {m.change > 0 ? "+" : ""}
            {euro(m.change)}
            {m.change_pct !== null ? ` (${m.change_pct > 0 ? "+" : ""}${m.change_pct}%)` : ""}
          </span>
        </div>
      ))
    )}
  </div>
);

const CategoryTable: React.FC<{ trends: Trends }> = ({ trends }) => {
  const rows = trends.categories.slice(0, 12);
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Category</th>
            {trends.months.map((m) => (
              <th key={m.label} className={m.partial ? styles.partialHead : undefined}>
                {m.label}
                {m.partial ? " *" : ""}
              </th>
            ))}
            <th>Average</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.key}>
              <td>{c.label}</td>
              {trends.months.map((m) => {
                const value = m.by_category[c.key] ?? 0;
                // Finished months are flagged when clearly above or below the usual (25% and at least 10 euros).
                const off = !m.partial && c.average > 0 && Math.abs(value - c.average) >= 10;
                const tone = !off ? undefined : value > c.average * 1.25 ? styles.high : value < c.average * 0.75 ? styles.low : undefined;
                return (
                  <td key={m.label} className={tone}>
                    {value > 0 ? euro(value) : "-"}
                  </td>
                );
              })}
              <td>{c.average > 0 ? euro(c.average) : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CompareView: React.FC = () => {
  const { months, setMonths, trends, pace, chosen, toggle, loading, error } = useTrends();

  if (loading && !trends) return <div className={styles.empty}>Loading...</div>;
  if (error) return <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div>;
  if (!trends) return null;

  const hasData = trends.months.some((m) => m.total > 0);
  if (!hasData) {
    return <div className={styles.empty}>Nothing to compare yet. Upload receipts and statements and the charts fill in.</div>;
  }

  const colourOf = (key: string) => PALETTE[chosen.indexOf(key) % PALETTE.length];
  const fixedShare = trends.average_total > 0 ? Math.round((trends.average_fixed / trends.average_total) * 100) : null;

  return (
    <div className={styles.stack}>
      {pace && (
        <div className={styles.card}>
          <div className={styles.head}>
            <h2 className={styles.title}>How this month is going</h2>
            <span className={styles.hint}>
              {euro(pace.current_total)} so far
              {pace.previous_total > 0 && ` · ${euro(pace.previous_same_day)} by this day last month · ${euro(pace.previous_total)} in total`}
            </span>
          </div>
          <PaceChart pace={pace} />
          {pace.unfair_comparison && (
            <span className={styles.hint}>
              Last month includes the bank statement (rent, insurance, ...) and this month has receipts only so far, so the
              lines will meet once this month&apos;s statement is uploaded.
            </span>
          )}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.head}>
          <h2 className={styles.title}>Compare categories</h2>
          <select className={styles.select} value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-label="Period">
            <option value={3}>Last 3 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
        </div>
        <span className={styles.hint}>Pick what to compare, for example eating out, groceries, fuel and charging.</span>
        <div className={styles.chips}>
          {trends.categories.map((c) => {
            const on = chosen.includes(c.key);
            return (
              <button key={c.key} type="button" className={`${styles.chip} ${on ? styles.chipOn : ""}`} onClick={() => toggle(c.key)} aria-pressed={on}>
                {on && <span className={styles.dot} style={{ background: colourOf(c.key) }} />}
                {c.label}
              </button>
            );
          })}
        </div>
        {chosen.length === 0 ? (
          <div className={styles.empty}>Pick at least one category.</div>
        ) : (
          <CategoryChart trends={trends} chosen={chosen} />
        )}
        <span className={styles.hint}>* The current month is not over yet, so its bars are lighter.</span>
      </div>

      {trends.movers.month ? (
        <>
          <span className={styles.hint}>
            {trends.movers.month} compared with your average of the {trends.movers.baseline_months} month
            {trends.movers.baseline_months === 1 ? "" : "s"} before it:
          </span>
          <div className={styles.two}>
            <Movers title="Spending more on" items={trends.movers.up} tone="up" />
            <Movers title="Spending less on" items={trends.movers.down} tone="down" />
          </div>
        </>
      ) : (
        <div className={styles.notice}>What went up and down shows here once two finished months have data.</div>
      )}

      <div className={styles.card}>
        <div className={styles.head}>
          <h2 className={styles.title}>Fixed costs and everything else</h2>
          {fixedShare !== null && <span className={styles.hint}>Fixed costs are {fixedShare}% of an average month.</span>}
        </div>
        <FixedChart trends={trends} />
        <span className={styles.hint}>Fixed = rent, insurance, phone, subscriptions and the like. Flexible is what you can steer.</span>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Every month side by side</h2>
        <CategoryTable trends={trends} />
        <span className={styles.hint}>
          Red: clearly more than usual. Green: clearly less. The average only counts finished months that have data.
        </span>
      </div>
    </div>
  );
};
