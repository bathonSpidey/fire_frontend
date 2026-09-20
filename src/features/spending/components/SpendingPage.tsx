import React from "react";
import { useSpending } from "../hooks/useSpending";
import type { MonthSpending, SpendingCategory } from "../types";
import styles from "../styles/Spending.module.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const euro = (value: number): string =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const DeltaBadge: React.FC<{ current: number; previous: number }> = ({ current, previous }) => {
  if (previous === 0) return null;
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 100);
  return (
    <span className={styles.delta}>
      {diff > 0 ? "+" : ""}
      {pct}% vs last month
    </span>
  );
};

const CategoryRow: React.FC<{ category: SpendingCategory; max: number }> = ({ category, max }) => {
  const receiptWidth = max > 0 ? (category.receipt_amount / max) * 100 : 0;
  const bankWidth = max > 0 ? (category.bank_amount / max) * 100 : 0;
  return (
    <div className={styles.row}>
      <span>
        {category.label}
        {category.fixed && <span className={styles.delta}>fixed</span>}
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

const Groups: React.FC<{ data: MonthSpending }> = ({ data }) => {
  const max = Math.max(...data.categories.map((c) => c.amount), 0);
  return (
    <>
      {data.groups.map((group) => (
        <div key={group.group} className={styles.group}>
          <div className={styles.groupHeader}>
            <span>{group.group}</span>
            <span>
              {euro(group.amount)} <span className={styles.muted}>({group.share_pct}%)</span>
            </span>
          </div>
          {data.categories
            .filter((c) => c.group === group.group)
            .map((c) => (
              <CategoryRow key={c.key} category={c} max={max} />
            ))}
        </div>
      ))}
    </>
  );
};

export const SpendingPage: React.FC = () => {
  const {
    month, year, data, loading, error, recheckMessage,
    handlePrev, handleNext, categorizeUncategorized,
  } = useSpending();

  return (
    <div className={styles.page}>
      <div className={styles.navigator}>
        <button className={styles.navButton} onClick={handlePrev} aria-label="Previous month">
          &lt;
        </button>
        <h1 className={styles.monthTitle}>
          {MONTHS[month - 1]} {year}
        </h1>
        <button className={styles.navButton} onClick={handleNext} aria-label="Next month">
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
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Spent this month</span>
              <span className={styles.kpiValue}>{euro(data.total)}</span>
              <span className={styles.kpiSub}>
                Last month {euro(data.previous_total)}
                <DeltaBadge current={data.total} previous={data.previous_total} />
              </span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>From receipts</span>
              <span className={styles.kpiValue}>{euro(data.receipt_total)}</span>
              <span className={styles.kpiSub}>
                {data.receipts.count} receipts, average {euro(data.receipts.average_basket)}
              </span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Bank only</span>
              <span className={styles.kpiValue}>{euro(data.bank_only_total)}</span>
              <span className={styles.kpiSub}>Paid without a receipt (rent, fuel, ...)</span>
            </div>
            <div className={styles.kpi}>
              <span className={styles.kpiLabel}>Saved with discounts</span>
              <span className={styles.kpiValue}>{euro(data.receipts.discounts_saved)}</span>
              <span className={styles.kpiSub}>Loyalty cards and offers on receipts</span>
            </div>
          </div>

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
            <div className={styles.group}>
              <h2 className={styles.sectionTitle}>By person</h2>
              <div className={styles.list}>
                {data.owners.map((o) => (
                  <div key={o.owner} className={styles.listRow}>
                    <span>{o.owner}</span>
                    <span className={styles.amount}>{euro(o.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
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
