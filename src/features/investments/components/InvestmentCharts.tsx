import React, { useMemo } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { euro, euroShort } from "../lib/format";
import { OTHER, brokerColor, chartColors, instrumentColors, useDarkMode } from "../lib/palette";
import type { Instrument, InvestMonth } from "../types";
import styles from "../styles/Investments.module.css";


const CHART_HEIGHT = 280;

interface Row {
  label: string;
  covered: boolean;
  [key: string]: string | number | boolean;
}

interface Series {
  key: string;
  color: string;
}

// Months without a statement are faded on the axis and say so in the tooltip: "not uploaded yet"
// is not the same as "nothing invested".
const MonthTick: React.FC<{
  x?: number; y?: number; payload?: { value: string }; covered: Record<string, boolean>; fill: string;
}> = ({ x = 0, y = 0, payload, covered, fill }) => (
  <text x={x} y={y + 12} textAnchor="middle" fontSize={12} fill={fill} opacity={covered[payload?.value ?? ""] === false ? 0.45 : 1}>
    {payload?.value}
  </text>
);

interface TipItem {
  name?: string | number;
  value?: number | string;
  color?: string;
  payload?: Row;
}

// Values lead, names follow; a short line in the series colour keys each row.
const Tip: React.FC<{ active?: boolean; payload?: TipItem[]; label?: string | number; total?: boolean }> = ({
  active, payload, label, total,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const covered = payload[0].payload?.covered !== false;
  const rows = payload.filter((p) => Number(p.value) !== 0);
  const sum = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
  return (
    <div className={styles.tooltip}>
      <span className={styles.tooltipTitle}>{label}</span>
      {!covered && <span className={styles.tooltipNote}>No statement uploaded for this month yet</span>}
      {covered && rows.length === 0 && <span className={styles.tooltipNote}>Nothing invested</span>}
      {rows.map((p) => (
        <span key={String(p.name)} className={styles.tooltipRow}>
          <span className={styles.tooltipKey} style={{ background: p.color }} />
          <strong>{euro(Number(p.value))}</strong>
          <span className={styles.tooltipName}>{p.name}</span>
        </span>
      ))}
      {total && rows.length > 1 && (
        <span className={styles.tooltipRow}>
          <span className={styles.tooltipKey} style={{ background: "transparent" }} />
          <strong>{euro(sum)}</strong>
          <span className={styles.tooltipName}>together</span>
        </span>
      )}
    </div>
  );
};

/** Runs of consecutive months that have no statement, as [first label, last label]. */
const gaps = (months: InvestMonth[]): [string, string][] => {
  const runs: [string, string][] = [];
  let start: string | null = null;
  months.forEach((m, i) => {
    if (!m.covered && start === null) start = m.label;
    if (start !== null && (m.covered || i === months.length - 1)) {
      runs.push([start, m.covered ? months[i - 1].label : m.label]);
      start = null;
    }
  });
  return runs;
};

const Legend: React.FC<{ series: { key: string; color: string }[] }> = ({ series }) =>
  series.length < 2 ? null : (
    <div className={styles.legend}>
      {series.map((s) => (
        <span key={s.key} className={styles.legendItem}>
          <span className={styles.legendKey} style={{ background: s.color }} />
          {s.key}
        </span>
      ))}
    </div>
  );

export const CumulativeChart: React.FC<{ months: InvestMonth[] }> = ({ months }) => {
  const dark = useDarkMode();
  const colors = useMemo(() => chartColors(dark), [dark]);
  const data = useMemo(() => {
    const totals = months.reduce<number[]>((acc, m) => [...acc, (acc[acc.length - 1] ?? 0) + m.net], []);
    return months.map((m, i) => ({ label: m.label, covered: m.covered, Total: Math.round(totals[i] * 100) / 100 }));
  }, [months]);
  const coveredByLabel = Object.fromEntries(months.map((m) => [m.label, m.covered]));
  const last = data.length - 1;

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={colors.grid} vertical={false} />
        {gaps(months).map(([a, b]) => (
          <ReferenceArea key={a} x1={a} x2={b} fill={colors.grid} fillOpacity={0.6} stroke="none" />
        ))}
        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: colors.grid }} interval="preserveStartEnd"
          tick={<MonthTick covered={coveredByLabel} fill={colors.axis} />} />
        <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={euroShort} tick={{ fill: colors.axis, fontSize: 12 }} />
        <Tooltip content={<Tip />} cursor={{ stroke: colors.axis, strokeWidth: 1 }} />
        <Area type="stepAfter" dataKey="Total" name="Invested in total" stroke={colors.accent} strokeWidth={2}
          fill={colors.accent} fillOpacity={0.1} isAnimationActive={false}
          activeDot={{ r: 4, fill: colors.accent, stroke: colors.surface, strokeWidth: 2 }}
          dot={(props: { cx?: number; cy?: number; index?: number; payload?: { Total: number } }) =>
            props.index === last && props.cx !== undefined && props.cy !== undefined ? (
              <g key="end">
                <circle cx={props.cx} cy={props.cy} r={4} fill={colors.accent} stroke={colors.surface} strokeWidth={2} />
                <text x={props.cx} y={props.cy - 12} textAnchor="end" fontSize={13} fontWeight={600} fill={colors.ink}>
                  {euro(props.payload?.Total ?? 0)}
                </text>
              </g>
            ) : (
              <g key={`d${props.index}`} />
            )
          }
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/** The monthly bars, one segment per broker (overview) or per instrument (a broker's page). */
export const MonthlyChart: React.FC<{
  months: InvestMonth[];
  by: "broker" | "instrument";
  instruments?: Instrument[];
}> = ({ months, by, instruments = [] }) => {
  const dark = useDarkMode();
  const colors = useMemo(() => chartColors(dark), [dark]);

  const { series, data } = useMemo(() => {
    const cap = colors.slots.length - 1; // more than this folds into "Other"
    const names =
      by === "broker"
        ? Array.from(new Set(months.flatMap((m) => Object.keys(m.by_broker))))
        : instruments.map((i) => i.name);
    const shown = by === "broker" ? names : names.filter((n) => n !== "Unknown").slice(0, cap);
    const palette = by === "broker" ? null : instrumentColors(colors, shown);
    const folded = names.filter((n) => n !== "Unknown" && !shown.includes(n));
    const keys = by === "broker" ? shown : [...shown, ...(folded.length > 0 ? [OTHER] : [])];
    const wants = (n: string) => (shown.includes(n) ? n : n === "Unknown" ? "Unknown" : OTHER);
    const all: Series[] = keys.map((k) => ({
      key: k,
      color: by === "broker" ? brokerColor(colors, k) : (palette as Record<string, string>)[k],
    }));
    const rows: Row[] = months.map((m) => {
      const row: Row = { label: m.label, covered: m.covered };
      const source = by === "broker" ? m.by_broker : m.by_instrument;
      Object.entries(source).forEach(([name, value]) => {
        const key = by === "broker" ? name : wants(name);
        row[key] = ((row[key] as number) ?? 0) + value;
      });
      return row;
    });
    // "Unknown" is a real part of the picture: shown last, in the neutral.
    if (by === "instrument" && rows.some((r) => "Unknown" in r)) all.push({ key: "Unknown", color: colors.neutral });
    return { series: all, data: rows };
  }, [months, by, instruments, colors]);

  const coveredByLabel = Object.fromEntries(months.map((m) => [m.label, m.covered]));
  return (
    <>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: colors.grid }} interval="preserveStartEnd"
            tick={<MonthTick covered={coveredByLabel} fill={colors.axis} />} />
          <YAxis tickLine={false} axisLine={false} width={64} tickFormatter={euroShort} tick={{ fill: colors.axis, fontSize: 12 }} />
          <Tooltip content={<Tip total />} cursor={{ fill: colors.grid, fillOpacity: 0.5 }} />
          {series.map((s, i) => (
            <Bar key={s.key} dataKey={s.key} name={s.key} stackId="m" fill={s.color} maxBarSize={24}
              stroke={colors.surface} strokeWidth={2} isAnimationActive={false}
              radius={i === series.length - 1 ? [4, 4, 0, 0] : 0} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};
