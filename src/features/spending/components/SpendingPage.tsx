import React, { useEffect, useState } from "react";
import { API_BASE } from "../../../core/api";
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
const OWNER_KEY = "fire.spending.owner";

const initialTab = (): Tab => {
  try {
    const saved = localStorage.getItem(TAB_KEY);
    if (TABS.some((t) => t.key === saved)) return saved as Tab;
  } catch {
    // storage can be blocked: the default is fine
  }
  return "month";
};

const initialOwner = (): string => {
  try {
    return localStorage.getItem(OWNER_KEY) ?? "";
  } catch {
    return "";
  }
};

export const SpendingPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [owners, setOwners] = useState<string[]>([]);
  const [owner, setOwner] = useState<string>(initialOwner);

  useEffect(() => {
    fetch(`${API_BASE}/documents/owners`)
      .then((res) => res.json())
      .then((list: string[]) => setOwners(list))
      .catch(() => {
        // the "everyone" view still works without the list
      });
  }, []);

  const choose = (next: Tab) => {
    setTab(next);
    try {
      localStorage.setItem(TAB_KEY, next);
    } catch {
      // remembering the tab is only a convenience
    }
  };

  const chooseOwner = (next: string) => {
    setOwner(next);
    try {
      localStorage.setItem(OWNER_KEY, next);
    } catch {
      // remembering the filter is only a convenience
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
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

        {tab !== "subscriptions" && owners.length > 0 && (
          <div className={styles.ownerFilter} role="group" aria-label="Filter by person">
            <button
              type="button"
              className={`${styles.ownerChip} ${owner === "" ? styles.ownerChipOn : ""}`}
              onClick={() => chooseOwner("")}
            >
              Everyone
            </button>
            {owners.map((name) => (
              <button
                key={name}
                type="button"
                className={`${styles.ownerChip} ${owner === name ? styles.ownerChipOn : ""}`}
                onClick={() => chooseOwner(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "month" && <MonthView owner={owner} />}
      {tab === "compare" && <CompareView owner={owner} />}
      {tab === "subscriptions" && <SubscriptionsView />}
    </div>
  );
};
