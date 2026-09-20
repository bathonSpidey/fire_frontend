import React from "react";
import type { Insights } from "../types";
import { GROUP_LABEL, REASONS } from "../types";
import type { StockGroup } from "../types";
import styles from "../styles/Inventory.module.css";

const euro = (value: number): string => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const reasonLabel = (key: string) => REASONS.find((r) => r.value === key)?.label ?? key;

const Bars: React.FC<{ data: Record<string, number>; label: (key: string) => string }> = ({ data, label }) => {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 0);
  if (entries.length === 0) return <span className={styles.meta}>Nothing thrown away. </span>;
  return (
    <>
      {entries.map(([key, value]) => (
        <div key={key} className={styles.bar}>
          <span>{label(key)}</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
          </div>
          <span>{euro(value)}</span>
        </div>
      ))}
    </>
  );
};

interface Props {
  insights: Insights;
  days: number;
  onDaysChange: (days: number) => void;
}

// The zero-waste picture: how much goes to the bin, why, and what to change.
export const InsightsPanel: React.FC<Props> = ({ insights, days, onDaysChange }) => {
  const nothingYet = insights.score === null;
  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className={styles.sectionTitle}>Waste and savings</h2>
        <select className={styles.select} value={days} onChange={(e) => onDaysChange(Number(e.target.value))} aria-label="Period">
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      <div className={styles.summary}>
        <div className={`${styles.card} ${!nothingYet && (insights.score ?? 0) >= 90 ? styles.cardGood : ""}`}>
          <span className={styles.label}>Zero-waste score</span>
          <span className={styles.bigScore}>{nothingYet ? "-" : insights.score}</span>
          <span className={styles.sub}>
            {nothingYet
              ? "Fills up once you mark things as used or thrown away."
              : `${insights.waste_rate_pct}% of what left the kitchen was thrown away.`}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Thrown away</span>
          <span className={styles.value}>{euro(insights.wasted_value)}</span>
          <span className={styles.sub}>
            {insights.wasted_items} item{insights.wasted_items === 1 ? "" : "s"} · used {euro(insights.used_value)}
          </span>
        </div>
        <div className={`${styles.card} ${insights.rescued.items > 0 ? styles.cardGood : ""}`}>
          <span className={styles.label}>Saved from the bin</span>
          <span className={styles.value}>{euro(insights.rescued.value)}</span>
          <span className={styles.sub}>
            {insights.rescued.items} item{insights.rescued.items === 1 ? "" : "s"} used up within 2 days of their date
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.label}>Days without waste</span>
          <span className={styles.value}>{insights.days_since_last_waste ?? "-"}</span>
          <span className={styles.sub}>
            {insights.days_since_last_waste === null ? "Nothing thrown away yet." : "since the last thing was thrown away"}
          </span>
        </div>
      </div>

      {insights.repeat_waste.length > 0 && (
        <div className={`${styles.notice} ${styles.cardWarn}`}>
          You keep throwing away: <strong>{insights.repeat_waste.join(", ")}</strong>. Buy smaller amounts or freeze it as
          soon as you get home.
        </div>
      )}

      <div className={styles.two}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Why it was thrown away</h3>
          <Bars data={insights.by_reason} label={reasonLabel} />
        </div>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Where it was kept</h3>
          <Bars data={insights.by_group} label={(key) => GROUP_LABEL[key as StockGroup] ?? key} />
        </div>
      </div>

      <div className={styles.two}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Most thrown away</h3>
          {insights.top_wasted.length === 0 ? (
            <span className={styles.meta}>Nothing yet.</span>
          ) : (
            <div className={styles.list}>
              {insights.top_wasted.map((t) => (
                <div key={t.name} className={styles.listRow}>
                  <span>
                    {t.name}
                    {t.times > 1 ? ` (${t.times}x)` : ""}
                  </span>
                  <span>{euro(t.value)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Bought twice</h3>
          {insights.duplicates.length === 0 ? (
            <span className={styles.meta}>Nothing in stock twice.</span>
          ) : (
            <div className={styles.list}>
              {insights.duplicates.map((d) => (
                <div key={d.name} className={styles.listRow}>
                  <span>{d.name}</span>
                  <span>{d.count} packs at home</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.two}>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Favourites: buy again</h3>
          {insights.liked.length === 0 ? (
            <span className={styles.meta}>Rate things after you finish them and your favourites show up here.</span>
          ) : (
            <div className={styles.list}>
              {insights.liked.map((l) => (
                <div key={l.name} className={styles.listRow}>
                  <span>{l.name}</span>
                  <span>{"★".repeat(l.rating || 0)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Not again</h3>
          {insights.avoid.length === 0 ? (
            <span className={styles.meta}>Nothing on the list.</span>
          ) : (
            <div className={styles.list}>
              {insights.avoid.map((a) => (
                <div key={a.name} className={styles.listRow}>
                  <span>{a.name}</span>
                  <span>{a.rating ? "★".repeat(a.rating) : ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
