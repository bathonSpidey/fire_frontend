import React, { useState } from "react";
import { CompareView } from "./CompareView";
import { MonthView } from "./MonthView";
import { SubscriptionsView } from "./SubscriptionsView";
import styles from "../styles/Spending.module.css";

type Tab = "month" | "compare" | "subscriptions";

const TABS: { key: Tab; label: string }[] = [
  { key: "month", label: "This month" },
  { key: "compare", label: "Compare" },
  { key: "subscriptions", label: "Subscriptions" },
];

const TAB_KEY = "fire.spending.tab";

const initialTab = (): Tab => {
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (TABS.some((t) => t.key === saved)) return saved as Tab;
  } catch {
    // storage can be blocked: the default is fine
  }
  return "month";
};

export const SpendingPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>(initialTab);

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
      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`${styles.tab} ${tab === t.key ? styles.tabOn : ""}`}
            onClick={() => choose(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "month" && <MonthView />}
      {tab === "compare" && <CompareView />}
      {tab === "subscriptions" && <SubscriptionsView />}
    </div>
  );
};
