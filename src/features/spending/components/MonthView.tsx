import React from "react";
import { useSpending } from "../hooks/useSpending";
import type { MonthSpending, SpendingCategory } from "../types";
import styles from "../styles/Spending.module.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// One accent colour per group (and, further down, per KPI card) - the same small palette
// Compare already uses for categories, so the app's colour language stays consistent.
const PALETTE = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6", "#f97316", "#ec4899", "#84cc16"];
const MIN_HIGHLIGHT_EUR = 10; // smaller moves are noise, same threshold Compare's movers use

const euro = (value: number): string =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const ChevronDown: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// Spending going up is worth noticing (red); going down is the good direction (green).
const DeltaBadge: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
  if (previous === 0) return null;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  const tone = diff > 0 ? styles.deltaUp : diff < 0 ? styles.deltaDown : "";
  return (
    <span className={`${styles.delta} ${tone}`}>
      {diff > 0 ? "+" : ""}
      {pct}% vs last month
    </span>
  );
};

// The 1-4 biggest moves vs last month, up front, so a real change never needs digging through
// every category row to spot.
const Highlights: React.FC<{ categories: SpendingCategory[] }> = ({ categories }) => {
  const changes = categories
    .filter((c) => c.previous_amount > 0)
    .map((c) => ({ key: c.key, label: c.label, change: c.amount - c.previous_amount }))
    .filter((c) => Math.abs(c.change) >= MIN_HIGHLIGHT_EUR);
  const up = [...changes].filter((c) => c.change > 0).sort((a, b) => b.change - a.change).slice(0, 2);
  const down = [...changes].filter((c) => c.change < 0).sort((a, b) => a.change - b.change).slice(0, 2);
  if (up.length === 0 && down.length === 0) return null;
  return (
    <div className={styles.highlights}>
      {up.map((c) => (
        <div key={c.key} className={`${styles.highlightCard} ${styles.highlightUp}`}>
          <span>{c.label} is up</span>
          <strong>+{euro(c.change)}</strong>
        </div>
      ))}
      {down.map((c) => (
        <div key={c.key} className={`${styles.highlightCard} ${styles.highlightDown}`}>
          <span>{c.label} is down</span>
          <strong>{euro(c.change)}</strong>
        </div>
      ))}
    </div>
  );
};

const CategoryRow: React.FC<{ category: SpendingCategory; max: number; color: string }> = ({ category, max, color }) => {
  const receiptWidth = max > 0 ? (category.receipt_amount / max) * 100 : 0;
  const bankWidth = max > 0 ? (category.bank_amount / max) * 100 : 0;
  return (
    <div className={styles.row} style={{ color }}>
      <span>
        {category.label}
        {category.fixed && <span className={styles.fixedBadge}>fixed</span>}
      </span>
      <div className={styles.barTrack} title={`${euro(category.receipt_amount)} from receipts, ${euro(category.bank_amount)} from the bank only`}>
        <div className={styles.barReceipt} style={{ width: `${receiptWidth}%` }} />
        <div className={styles.barBank} style={{ width: `${bankWidth}%` }} />
      </div>
      <span className={styles.amount}>
        {euro(category.amount)}
        <DeltaBadge current={category.amount} previous={category.previous_amount} />
      </span>
    </div>
  );
};

// Each group is a collapsible card (native <details>, no JS state needed): the header alone -
// name, colour, total, share and a mini bar - already IS the overview; category-level detail is
// opt-in. The biggest group (data.groups is sorted by amount) opens by default.
const Groups: React.FC<{ data: MonthSpending }> = ({ data }) => {
  const max = Math.max(...data.categories.map((c) => c.amount), 0);
  return (
    <>
      {data.groups.map((group, index) => {
        const color = PALETTE[index % PALETTE.length];
        return (
          <details key={group.group} className={styles.groupCard} open={index === 0}>
            <summary className={styles.groupSummary}>
              <span className={styles.groupAccent} style={{ background: color }} />
              <span className={styles.groupName}>{group.group}</span>
              <span className={styles.groupBarTrack}>
                <span className={styles.groupBarFill} style={{ width: `${group.share_pct}%`, background: color }} />
              </span>
              <span className={styles.groupMeta}>
                {euro(group.amount)} <span className={styles.muted}>({group.share_pct}%)</span>
              </span>
              <span className={styles.groupChevron}>
                <ChevronDown />
              </span>
            </summary>
            <div className={styles.categoryList}>
              {data.categories
                .filter((c) => c.group === group.group)
                .map((c) => (
                  <CategoryRow key={c.key} category={c} max={max} color={color} />
                ))}
            </div>
          </details>
        );
      })}
    </>
  );
};

export const MonthView: React.FC<{ owner?: string }> = ({ owner = "" }) => {
  const {
    month, year, data, loading, error, recheckMessage, canGoNext,
    handlePrev, handleNext, categorizeUncategorized,
  } = useSpending(owner);

  return (
    <div className={styles.stack}>
      <div className={styles.navigator}>
        <button className={styles.navButton} onClick={handlePrev} aria-label="Previous month">
          &lt;
        </button>
        <h1 className={styles.monthTitle}>
          {MONTHS[month - 1]} {year}
        </h1>
        <button
          className={styles.navButton}
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Next month"
          title={canGoNext ? undefined : "This is the current month"}
          style={canGoNext ? undefined : { opacity: 0.35, cursor: "default" }}
        >
          &gt;
        </button>
      </div>

      {error && <div className={styles.notice}>{error}</div>}
      {loading && !data && <div className={styles.empty}>Loading...</div>}

      {data && data.categories.length === 0 && (
        <div className={styles.empty}>
          Nothing recorded for this month yet. Upload receipts and they show up here right away.
        </div>
      )}

      {data && data.categories.length > 0 && (
        <>
          <div className={styles.kpis}>
            <div className={styles.kpi} style={{ borderLeftColor: "var(--primary)" }}>
              <span className={styles.kpiLabel}>Spent this month</span>
              <span className={styles.kpiValue}>{euro(data.total)}</span>
              <span className={styles.kpiSub}>
                Last month {euro(data.previous_total)}
                <DeltaBadge current={data.total} previous={data.previous_total} />
              </span>
            </div>
            <div className={styles.kpi} style={{ borderLeftColor: "#6366f1" }}>
              <span className={styles.kpiLabel}>From receipts</span>
              <span className={styles.kpiValue}>{euro(data.receipt_total)}</span>
              <span className={styles.kpiSub}>
                {data.receipts.count} receipts, average {euro(data.receipts.average_basket)}
              </span>
            </div>
            <div className={styles.kpi} style={{ borderLeftColor: "#3b82f6" }}>
              <span className={styles.kpiLabel}>Bank only</span>
              <span className={styles.kpiValue}>{euro(data.bank_only_total)}</span>
              <span className={styles.kpiSub}>Paid without a receipt (rent, fuel, ...)</span>
            </div>
            <div className={styles.kpi} style={{ borderLeftColor: "var(--success-text)" }}>
              <span className={styles.kpiLabel}>Saved with discounts</span>
              <span className={styles.kpiValue}>{euro(data.receipts.discounts_saved)}</span>
              <span className={styles.kpiSub}>Loyalty cards and offers on receipts</span>
            </div>
            <div className={styles.kpi} style={{ borderLeftColor: "#f59e0b" }}>
              <span className={styles.kpiLabel}>Fixed costs</span>
              <span className={styles.kpiValue}>{euro(data.fixed_total)}</span>
              <span className={styles.kpiSub}>Locked in regardless (rent, insurance, subscriptions)</span>
            </div>
            <div className={styles.kpi} style={{ borderLeftColor: "#a855f7" }}>
              <span className={styles.kpiLabel}>Flexible spending</span>
              <span className={styles.kpiValue}>{euro(data.flexible_total)}</span>
              <span className={styles.kpiSub}>The lever that is actually yours to pull</span>
            </div>
          </div>

          <Highlights categories={data.categories} />

          {data.discrepancies.awaiting_statement && (
            <div className={styles.notice}>
              Tracked from receipts only so far. Bank-only costs such as rent and insurance appear
              when this month&apos;s bank statement is uploaded, and it will also check everything
              here.
            </div>
          )}

          {data.uncategorized.entries > 0 && (
            <div className={`${styles.notice} ${styles.noticeRow}`}>
              <span>
                {data.uncategorized.entries} entries ({euro(data.uncategorized.amount)}) have no
                category.
              </span>
              <button className={styles.actionButton} onClick={categorizeUncategorized}>
                Ask Claude to categorize them
              </button>
              {recheckMessage && <span className={styles.muted}>{recheckMessage}</span>}
            </div>
          )}

          <div className={styles.legend}>
            <span>Dark bar: from receipts</span>
            <span>Light bar: bank only</span>
          </div>

          <Groups data={data} />

          <div className={styles.twoCol}>
            {!owner && (
              <div className={styles.group}>
                <h2 className={styles.sectionTitle}>By person</h2>
                <div className={styles.list}>
                  {data.owners.map((o) => (
                    <div key={o.owner} className={styles.listRow} style={{ flexDirection: "column", gap: 2 }}>
                      <div className={styles.listRow} style={{ width: "100%" }}>
                        <span>{o.owner}</span>
                        <span className={styles.amount}>{euro(o.amount)}</span>
                      </div>
                      <span className={styles.muted} style={{ fontSize: "0.8125rem" }}>
                        {euro(o.fixed)} fixed &middot; {euro(o.flexible)} flexible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.group}>
              <h2 className={styles.sectionTitle}>Top stores</h2>
              <div className={styles.list}>
                {data.stores.map((s) => (
                  <div key={s.store} className={styles.listRow}>
                    <span>{s.store}</span>
                    <span className={styles.amount}>{euro(s.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(data.discrepancies.missing_receipts.length > 0 ||
            data.discrepancies.unmatched_receipts.length > 0) && (
            <div className={styles.group}>
              <h2 className={styles.sectionTitle}>Worth a look (bank statement check)</h2>
              {data.discrepancies.missing_receipts.length > 0 && (
                <>
                  <span className={styles.muted}>
                    Paid at stores that normally give receipts, but no receipt uploaded:
                  </span>
                  <div className={styles.list}>
                    {data.discrepancies.missing_receipts.map((m) => (
                      <div key={m.transaction_id} className={styles.listRow}>
                        <span>
                          {m.date} {m.counterparty}
                        </span>
                        <span className={styles.amount}>{euro(m.amount)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {data.discrepancies.unmatched_receipts.length > 0 && (
                <>
                  <span className={styles.muted}>
                    Receipts that never appeared on a bank statement (cash, another account, or a
                    statement not uploaded yet):
                  </span>
                  <div className={styles.list}>
                    {data.discrepancies.unmatched_receipts.map((r) => (
                      <div key={r.receipt_id} className={styles.listRow}>
                        <span>
                          {r.date} {r.store}
                          {r.owner ? ` (${r.owner})` : ""}
                        </span>
                        <span className={styles.amount}>{euro(r.total)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
