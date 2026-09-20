import React, { useMemo, useState } from "react";
import { useStock } from "../hooks/useStock";
import { DEFAULT_PLACES, GROUP_LABEL } from "../types";
import type { StockGroup, StockItem } from "../types";
import { InsightsPanel } from "./InsightsPanel";
import { Stars, StockRow } from "./StockRow";
import styles from "../styles/Inventory.module.css";

type Tab = "stock" | "waste";
type Filter = StockGroup | "all" | "opened";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "fridge", label: GROUP_LABEL.fridge },
  { key: "freezer", label: GROUP_LABEL.freezer },
  { key: "pantry", label: GROUP_LABEL.pantry },
  { key: "home", label: GROUP_LABEL.home },
  { key: "opened", label: "Opened" },
];

const euro = (value: number): string => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export const InventoryPage: React.FC = () => {
  const stock = useStock();
  const { items, summary, insights, loading, error } = stock;
  const [tab, setTab] = useState<Tab>("stock");
  const [filter, setFilter] = useState<Filter>("all");
  const [place, setPlace] = useState("");
  const [search, setSearch] = useState("");
  const [showStale, setShowStale] = useState(false);

  // Places the household has already named come first, then sensible defaults per group.
  const usedPlaces = useMemo(
    () => Array.from(new Set(items.map((i) => i.location).filter((p): p is string => !!p))).sort(),
    [items],
  );
  const suggestions = (group: StockGroup): string[] =>
    Array.from(new Set([...usedPlaces, ...DEFAULT_PLACES[group]]));

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((i) => {
      if (filter === "opened" ? !i.opened_on : filter !== "all" && i.group !== filter) return false;
      if (place && i.location !== place) return false;
      if (!term) return true;
      return [i.name, i.brand, i.category, i.location, i.store].some((f) => f?.toLowerCase().includes(term));
    });
  }, [items, filter, place, search]);

  // The things that must be used first are pulled out of the list, so nothing is forgotten.
  const isUrgent = (i: StockItem) => (i.urgency === "expired" || i.urgency === "soon") && !i.stale;
  const useFirst = visible.filter(isUrgent);
  const rest = visible.filter((i) => !isUrgent(i) && !i.stale);
  // Long past their date and never ticked off: most likely eaten already, so one click clears them.
  const stale = visible.filter((i) => i.stale);

  const renderRow = (item: StockItem) => (
    <StockRow
      key={item.id}
      item={item}
      places={suggestions(item.group)}
      onUseOne={() => stock.useOne(item.id)}
      onUsedUp={() => stock.usedUp(item.id)}
      onOpened={() => stock.opened(item.id)}
      onFreeze={() => stock.freeze(item.id)}
      onDiscard={(reason) => stock.discard(item.id, reason)}
      onUpdate={(patch) => stock.update(item.id, patch)}
    />
  );

  if (loading && !summary) return <div className={styles.page}>Loading the inventory...</div>;

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>Inventory</h1>
        <p className={styles.intro}>
          What is at home, where it is, and when it needs to be used. Use the oldest first, freeze what you cannot finish, and
          nothing needs to be thrown away.
        </p>
      </div>

      {error && <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div>}

      {summary && (
        <div className={styles.summary}>
          <div className={styles.card}>
            <span className={styles.label}>At home</span>
            <span className={styles.value}>{summary.items}</span>
            <span className={styles.sub}>
              {GROUP_LABEL.fridge} {summary.groups.fridge} · {GROUP_LABEL.freezer} {summary.groups.freezer} ·{" "}
              {GROUP_LABEL.pantry} {summary.groups.pantry} · {GROUP_LABEL.home} {summary.groups.home}
            </span>
          </div>
          <div className={`${styles.card} ${summary.use_soon > 0 ? styles.cardWarn : ""}`}>
            <span className={styles.label}>Use first</span>
            <span className={styles.value}>{summary.use_soon}</span>
            <span className={styles.sub}>
              {summary.use_soon === 0 ? "Nothing goes off in the next 3 days." : `${euro(summary.value_at_risk)} would be lost`}
            </span>
          </div>
          <div className={styles.card}>
            <span className={styles.label}>Opened</span>
            <span className={styles.value}>{summary.opened}</span>
            <span className={styles.sub}>Opened things go off sooner.</span>
          </div>
          <div className={`${styles.card} ${insights && (insights.score ?? 0) >= 90 ? styles.cardGood : ""}`}>
            <span className={styles.label}>Zero-waste score</span>
            <span className={styles.value}>{insights?.score ?? "-"}</span>
            <span className={styles.sub}>100 means nothing was thrown away.</span>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${tab === "stock" ? styles.tabOn : ""}`} onClick={() => setTab("stock")}>
          Stock
        </button>
        <button type="button" className={`${styles.tab} ${tab === "waste" ? styles.tabOn : ""}`} onClick={() => setTab("waste")}>
          Waste and savings
        </button>
      </div>

      {tab === "waste" && insights && (
        <InsightsPanel insights={insights} days={stock.insightDays} onDaysChange={stock.setInsightDays} />
      )}

      {tab === "stock" && (
        <>
          {stock.toRate.length > 0 && (
            <div className={`${styles.card} ${styles.cardGood}`}>
              <span className={styles.sectionTitle}>All gone. How was it?</span>
              {stock.toRate.map((i) => (
                <div key={i.id} className={styles.listRow}>
                  <span>{i.name}</span>
                  <span className={styles.actions}>
                    <Stars value={i.rating} onChange={(rating) => stock.rate(i.id, { rating })} label={`Rate ${i.name}`} />
                    <button
                      type="button"
                      className={styles.action}
                      onClick={() => {
                        stock.rate(i.id, { would_rebuy: i.would_rebuy === false ? null : false });
                      }}
                    >
                      {i.would_rebuy === false ? "Not again (undo)" : "Not again"}
                    </button>
                    <button type="button" className={styles.action} onClick={() => stock.dismissRating(i.id)}>
                      Done
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.filters}>
            <input
              className={`${styles.input} ${styles.grow}`}
              placeholder="Search: name, brand, place, store..."
              aria-label="Search the inventory"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className={styles.select} value={place} onChange={(e) => setPlace(e.target.value)} aria-label="Filter by place">
              <option value="">Every place</option>
              {usedPlaces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.chips}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`${styles.chip} ${filter === f.key ? styles.tabOn : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {useFirst.length > 0 && (
            <div className={styles.urgentBox}>
              <div className={styles.sectionHead}>
                <h2 className={styles.sectionTitle}>Use these first ({useFirst.length})</h2>
                <button type="button" className={styles.action} disabled={stock.meals.loading} onClick={stock.askMeals}>
                  {stock.meals.loading ? "Thinking..." : "What can we cook?"}
                </button>
              </div>
              {(stock.meals.text || stock.meals.message) && (
                <div className={styles.notice}>{stock.meals.text ?? stock.meals.message}</div>
              )}
              {useFirst.map(renderRow)}
            </div>
          )}

          {stale.length > 0 && (
            <div className={`${styles.card} ${styles.cardWarn}`}>
              <span className={styles.sectionTitle}>Probably long gone ({stale.length})</span>
              <span className={styles.sub}>
                These passed their date more than 2 weeks ago and were never ticked off, most likely they were eaten. Clearing
                them counts as used up, not thrown away, so the score stays honest. Anything still there can be handled below.
              </span>
              <div className={styles.actions}>
                <button type="button" className={`${styles.action} ${styles.actionMain}`} onClick={stock.clearStale}>
                  They are all used up, clear them
                </button>
                <button type="button" className={styles.action} onClick={() => setShowStale((v) => !v)}>
                  {showStale ? "Hide the list" : "Show the list"}
                </button>
              </div>
              {showStale && <div>{stale.map(renderRow)}</div>}
            </div>
          )}

          {items.length === 0 ? (
            <div className={styles.empty}>Nothing at home yet. Upload a grocery receipt and it shows up here.</div>
          ) : visible.length === 0 ? (
            <div className={styles.empty}>Nothing matches. Clear the search or pick another place.</div>
          ) : (
            rest.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  {filter === "all" ? "Everything else" : FILTERS.find((f) => f.key === filter)?.label} ({rest.length})
                </h2>
                <div>{rest.map(renderRow)}</div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};
