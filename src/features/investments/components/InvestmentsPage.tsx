import React, { useState } from "react";
import { useInvestments } from "../hooks/useInvestments";
import { brokerColor, chartColors, useDarkMode } from "../lib/palette";
import type { Broker } from "../types";
import { BrokerView, OverviewView } from "./InvestmentViews";
import { PlansView } from "./PlansView";
import styles from "../styles/Investments.module.css";

type Tab = "overview" | "plans" | Broker;

const TAB_KEY = "fire.investments.tab";

const initialTab = (): Tab => {
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === "overview" || saved === "plans" || saved === "N26" || saved === "Commerzbank" || saved === "Sparkasse") return saved;
  } catch {
    // storage can be blocked: the overview is fine
  }
  return "overview";
};

export const InvestmentsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [brokers, setBrokers] = useState<Broker[]>(["N26", "Commerzbank"]);
  // A tab that no longer exists (a broker left without investments) falls back to the overview.
  const active: Tab = tab === "overview" || tab === "plans" || brokers.includes(tab) ? tab : "overview";
  const { data, brokers: known, loading, error, changeBooking, labelBooking } = useInvestments(
    active === "overview" || active === "plans" ? null : active,
  );
  if (known.join() !== brokers.join()) setBrokers(known);
  const colors = chartColors(useDarkMode());

  const choose = (next: Tab) => {
    setTab(next);
    try {
      localStorage.setItem(TAB_KEY, next);
    } catch {
      // remembering the tab is only a convenience
    }
  };

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Investments</h1>
        <p className={styles.intro}>
          How much you put into the market, read from your bank statements. Profit and loss are not known, so they are
          never guessed.
        </p>
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={active === "overview"}
          className={`${styles.tab} ${active === "overview" ? styles.tabOn : ""}`} onClick={() => choose("overview")}>
          Overview
        </button>
        {brokers.map((b) => (
          <button key={b} type="button" role="tab" aria-selected={active === b}
            className={`${styles.tab} ${active === b ? styles.tabOn : ""}`} onClick={() => choose(b)}>
            <span className={styles.dot} style={{ background: brokerColor(colors, b) }} />
            {b}
          </button>
        ))}
        <button type="button" role="tab" aria-selected={active === "plans"}
          className={`${styles.tab} ${active === "plans" ? styles.tabOn : ""}`} onClick={() => choose("plans")}>
          Plans
        </button>
      </div>

      {active === "plans" && (
        <div className={styles.stack}>
          <PlansView />
        </div>
      )}

      {active !== "plans" && error && <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div>}
      {active !== "plans" && !data && !error && <div className={styles.empty}>Loading...</div>}

      {active !== "plans" && data && (
        <div className={`${styles.stack} ${loading ? styles.dim : ""}`}>
          {data.broker === null ? (
            <OverviewView data={data} onChange={changeBooking} />
          ) : (
            <BrokerView data={data} broker={data.broker} onChange={changeBooking} onLabel={labelBooking} />
          )}
        </div>
      )}
    </div>
  );
};
