import React, { useState } from "react";
import { useInvestments } from "../hooks/useInvestments";
import { brokerColor, chartColors, useDarkMode } from "../lib/palette";
import type { Broker } from "../types";
import { BrokerView, OverviewView } from "./InvestmentViews";
import styles from "../styles/Investments.module.css";

type Tab = "overview" | Broker;

const TAB_KEY = "fire.investments.tab";

const initialTab = (): Tab => {
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved === "overview" || saved === "N26" || saved === "Commerzbank" || saved === "Sparkasse") return saved;
  } catch {
    // storage can be blocked: the overview is fine
  }
  return "overview";
};

export const InvestmentsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [brokers, setBrokers] = useState<Broker[]>(["N26", "Commerzbank"]);
  // A tab that no longer exists (a broker left without investments) falls back to the overview.
  const active: Tab = tab === "overview" || brokers.includes(tab) ? tab : "overview";
  const { data, brokers: known, loading, error, changeBooking } = useInvestments(active === "overview" ? null : active);
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
      </div>

      {error && <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div>}
      {!data && !error && <div className={styles.empty}>Loading...</div>}

      {data && (
        <div className={`${styles.stack} ${loading ? styles.dim : ""}`}>
          {data.broker === null ? (
            <OverviewView data={data} onChange={changeBooking} />
          ) : (
            <BrokerView data={data} broker={data.broker} onChange={changeBooking} />
          )}
        </div>
      )}
    </div>
  );
};
