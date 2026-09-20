import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSubscriptions } from "../hooks/useSubscriptions";
import type { Frequency, Subscription } from "../types";
import styles from "../styles/SpendingViews.module.css";

const euro = (value: number): string => value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

const PER: Record<Frequency, string> = { monthly: "month", quarterly: "quarter", yearly: "year" };

const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" });

interface RowProps {
  item: Subscription;
  onDecide: (key: string, rule: { frequency?: Frequency | null; hidden?: boolean }) => void;
}

const evidenceBadge = (item: Subscription): { text: string; className: string } => {
  if (item.evidence === "you") return { text: "confirmed by you", className: styles.badgeGood };
  if (item.confidence === "confirmed") return { text: `paid ${item.payments} times`, className: styles.badgeGood };
  if (item.confidence === "likely") return { text: `paid ${item.payments} times`, className: styles.badge };
  return { text: "seen once, assumed monthly", className: styles.badgeWarn };
};

const SubscriptionRow: React.FC<RowProps> = ({ item, onDecide }) => {
  const badge = evidenceBadge(item);
  const rose = item.price_change && item.price_change.to > item.price_change.from;
  return (
    <div className={styles.row}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.name}>{item.name}</div>
          <div className={styles.meta}>
            {item.category} · last paid {shortDate(item.last_date)}
            {item.next_expected && item.status === "active" ? ` · next around ${shortDate(item.next_expected)}` : ""}
          </div>
        </div>
        <div className={styles.price}>
          {euro(item.amount)} / {PER[item.frequency]}
          {item.frequency !== "monthly" && <div className={styles.meta}>{euro(item.monthly_cost)} per month</div>}
        </div>
      </div>

      <div className={styles.badges}>
        <span className={`${styles.badge} ${badge.className}`}>{badge.text}</span>
        {item.price_change && (
          <span className={`${styles.badge} ${rose ? styles.badgeWarn : styles.badgeGood}`}>
            {rose ? "price went up" : "price went down"}: {euro(item.price_change.from)} to {euro(item.price_change.to)}
          </span>
        )}
        {item.status === "ended" && <span className={styles.badge}>no payment since {shortDate(item.last_date)}</span>}
      </div>

      <div className={styles.actions}>
        {item.confidence === "assumed" && item.evidence !== "you" && (
          <button type="button" className={`${styles.action} ${styles.actionMain}`} onClick={() => onDecide(item.key, { frequency: "monthly" })}>
            Yes, every month
          </button>
        )}
        <select
          className={styles.action}
          value={item.evidence === "you" ? item.frequency : ""}
          aria-label={`How often is ${item.name} charged?`}
          onChange={(e) => e.target.value && onDecide(item.key, { frequency: e.target.value as Frequency })}
        >
          <option value="">Charged...</option>
          <option value="monthly">Every month</option>
          <option value="quarterly">Every 3 months</option>
          <option value="yearly">Every year</option>
        </select>
        {item.evidence === "you" && (
          <button type="button" className={styles.action} onClick={() => onDecide(item.key, {})}>
            Back to detected
          </button>
        )}
        <button type="button" className={styles.action} onClick={() => onDecide(item.key, { hidden: true })}>
          Not a subscription
        </button>
      </div>
    </div>
  );
};

const YearlyChart: React.FC<{ items: Subscription[] }> = ({ items }) => {
  const data = [...items].sort((a, b) => b.yearly_cost - a.yearly_cost).slice(0, 10).map((i) => ({ name: i.name, yearly: i.yearly_cost }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 36 + 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} stroke="var(--border)" tickFormatter={(v) => `${Math.round(v)} €`} />
        <YAxis type="category" dataKey="name" width={140} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} stroke="var(--border)" />
        <Tooltip
          cursor={{ fill: "var(--surface-raised)" }}
          formatter={(value) => euro(Number(value))}
          contentStyle={{ background: "var(--surface)", border: "0.5px solid var(--border-strong)", borderRadius: 8, color: "var(--text-primary)" }}
          labelStyle={{ color: "var(--text-primary)" }}
        />
        <Bar dataKey="yearly" name="Per year" fill="#6366f1" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SubscriptionsView: React.FC = () => {
  const { data, loading, error, decide } = useSubscriptions();
  const [showEnded, setShowEnded] = useState(false);

  if (loading && !data) return <div className={styles.empty}>Loading...</div>;
  if (!data) return error ? <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div> : null;

  const active = data.items.filter((i) => i.status === "active");
  const ended = data.items.filter((i) => i.status === "ended");
  const subscriptions = active.filter((i) => i.section === "subscription");
  const bills = active.filter((i) => i.section === "bill");
  const s = data.summary;

  if (data.items.length === 0 && data.hidden.length === 0) {
    return (
      <div className={styles.empty}>
        No recurring payments found yet. Upload bank statements and Netflix, phone, gym, insurance and the like show up
        here. They get more precise with every month you add.
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {error && <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div>}

      <div className={`${styles.two}`}>
        <div className={styles.card}>
          <span className={styles.hint}>Recurring payments per month</span>
          <span style={{ fontSize: "1.8rem", fontWeight: 600 }}>{euro(s.monthly_total)}</span>
          <span className={styles.hint}>
            {euro(s.yearly_total)} per year · subscriptions {euro(s.subscriptions_monthly)}, fixed bills {euro(s.bills_monthly)}
          </span>
        </div>
        <div className={`${styles.card} ${s.assumed_monthly > 0 || s.price_rises > 0 ? styles.cardWarn : ""}`}>
          <span className={styles.hint}>Worth a look</span>
          <span>
            {s.price_rises > 0 && `${s.price_rises} price rise${s.price_rises === 1 ? "" : "s"}. `}
            {s.assumed_monthly > 0
              ? `${euro(s.assumed_monthly)} per month is only guessed from one payment. Confirm or correct those below.`
              : "Every recurring payment is confirmed by more than one payment."}
          </span>
          {data.statements_reach && <span className={styles.hint}>Bank statements reach up to {shortDate(data.statements_reach)}.</span>}
        </div>
      </div>

      {active.length > 1 && (
        <div className={styles.card}>
          <h2 className={styles.title}>Where the yearly cost goes</h2>
          <YearlyChart items={active} />
        </div>
      )}

      {subscriptions.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.title}>Subscriptions and memberships ({subscriptions.length})</h2>
          <div>{subscriptions.map((i) => <SubscriptionRow key={i.key} item={i} onDecide={decide} />)}</div>
        </div>
      )}

      {bills.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.title}>Fixed bills ({bills.length})</h2>
          <div>{bills.map((i) => <SubscriptionRow key={i.key} item={i} onDecide={decide} />)}</div>
        </div>
      )}

      {ended.length > 0 && (
        <div className={styles.card}>
          <div className={styles.head}>
            <h2 className={styles.title}>Stopped ({ended.length})</h2>
            <button type="button" className={styles.action} onClick={() => setShowEnded((v) => !v)}>
              {showEnded ? "Hide" : "Show"}
            </button>
          </div>
          <span className={styles.hint}>No payment although the statements cover the time since. Not counted in the totals.</span>
          {showEnded && <div>{ended.map((i) => <SubscriptionRow key={i.key} item={i} onDecide={decide} />)}</div>}
        </div>
      )}

      {data.hidden.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.title}>Hidden ({data.hidden.length})</h2>
          {data.hidden.map((h) => (
            <div key={h.key} className={styles.moverRow}>
              <span>{h.name}</span>
              <button type="button" className={styles.action} onClick={() => decide(h.key, {})}>
                Show again
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
