import React, { useState } from "react";
import type { Booking, BookingKind, Flow, Instrument, InvestMonth, InvestYear, MovedOut } from "../types";
import { MANUAL, UNKNOWN } from "../types";
import { euro, shortDate } from "../lib/format";
import styles from "../styles/Investments.module.css";

export const YearsTable: React.FC<{ years: InvestYear[] }> = ({ years }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Year</th>
          <th>Invested</th>
          <th>Buys</th>
          <th>Sold</th>
          <th>Per month</th>
          <th>Months with a statement</th>
        </tr>
      </thead>
      <tbody>
        {[...years].reverse().map((y) => (
          <tr key={y.year}>
            <td>{y.year}</td>
            <td>
              <strong>{euro(y.net)}</strong>
            </td>
            <td>{euro(y.bought)}</td>
            <td>{y.sold > 0 ? euro(y.sold) : "-"}</td>
            <td>{euro(y.avg_per_month)}</td>
            <td>{y.months}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const InstrumentsTable: React.FC<{ instruments: Instrument[] }> = ({ instruments }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Instrument</th>
          <th>Invested</th>
          <th>Share</th>
          <th>Buys</th>
          <th>Per month</th>
          <th>Last buy</th>
        </tr>
      </thead>
      <tbody>
        {instruments.map((i) => (
          <tr key={i.code ?? i.name}>
            <td>
              {i.name === UNKNOWN ? (
                <span className={styles.muted}>Not known: nothing says what was bought</span>
              ) : i.name === MANUAL ? (
                <span>
                  Manual buys <span className={styles.muted}>outside your plans: type the ticker on each one</span>
                </span>
              ) : (
                i.name
              )}
              {i.code && <span className={styles.code}>{i.code}</span>}
            </td>
            <td>
              <strong>{euro(i.net)}</strong>
            </td>
            <td>
              <span className={styles.shareBar} aria-hidden="true">
                <span className={styles.shareFill} style={{ width: `${Math.max(0, Math.min(100, i.share_pct))}%` }} />
              </span>
              {i.share_pct}%
            </td>
            <td>{i.buys}</td>
            <td>{euro(i.per_month)}</td>
            <td>{shortDate(i.last)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const MonthsTable: React.FC<{ months: InvestMonth[] }> = ({ months }) => (
  <div className={styles.tableWrap}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Month</th>
          <th>Invested</th>
          <th>Buys</th>
          <th>Sold</th>
          <th>Bookings</th>
        </tr>
      </thead>
      <tbody>
        {[...months].reverse().map((m) => (
          <tr key={m.label} className={m.covered ? undefined : styles.faded}>
            <td>{m.label}</td>
            {m.covered ? (
              <>
                <td>
                  <strong>{euro(m.net)}</strong>
                </td>
                <td>{euro(m.bought)}</td>
                <td>{m.sold > 0 ? euro(m.sold) : "-"}</td>
                <td>{m.count}</td>
              </>
            ) : (
              <td colSpan={4}>No statement uploaded yet</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const FlowList: React.FC<{ title: string; hint: string; total: number; items: Flow[] }> = ({
  title, hint, total, items,
}) =>
  items.length === 0 ? null : (
    <details className={styles.card}>
      <summary className={styles.summaryRow}>
        <span>
          <strong>{title}</strong> <span className={styles.muted}>{hint}</span>
        </span>
        <strong>{euro(total)}</strong>
      </summary>
      <div className={styles.list}>
        {items.map((f, i) => (
          <div key={`${f.date}-${i}`} className={styles.listRow}>
            <span>
              {shortDate(f.date)} <span className={styles.muted}>{f.text}</span>
            </span>
            <span>{euro(f.amount)}</span>
          </div>
        ))}
      </div>
    </details>
  );

const SOURCE_NOTE: Record<string, string> = {
  plan: "from the plan's schedule",
  plan_amount: "the only plan with this amount",
  manual: "typed by you",
  booking: "named in the booking",
};

const BookingRow: React.FC<{
  booking: Booking;
  known: string[];
  onMove: (id: number, kind: BookingKind) => void;
  onLabel: (id: number, instrument: string | null) => void;
}> = ({ booking: b, known, onMove, onLabel }) => {
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState(b.source === "manual" ? b.instrument : "");
  const nameless = b.instrument === UNKNOWN || b.instrument === MANUAL;
  const what =
    b.source === "ambiguous"
      ? `one of ${b.candidates.join(", ")}`
      : b.instrument === UNKNOWN
        ? "what it bought is not known"
        : b.instrument === MANUAL
          ? "bought outside your plans"
          : b.instrument;

  const save = () => {
    if (text.trim()) {
      onLabel(b.id, text.trim());
      setTyping(false);
    }
  };

  return (
    <div className={styles.bookingRow}>
      <div className={styles.listRow}>
        <span>
          {shortDate(b.date)} <strong className={nameless ? styles.mutedStrong : undefined}>{what}</strong>
          {SOURCE_NOTE[b.source] && <span className={styles.muted}> · {SOURCE_NOTE[b.source]}</span>}
        </span>
        <span className={styles.rowEnd}>
          {b.amount < 0 ? `${euro(-b.amount)} sold` : euro(b.amount)}
          <button type="button" className={styles.smallButton} onClick={() => setTyping(!typing)}>
            {nameless || b.source === "ambiguous" ? "What was it?" : "Change"}
          </button>
          <button type="button" className={styles.smallButton} onClick={() => onMove(b.id, "internal_transfer")}
            title="It is money moved to my own account, not an investment: take it out of these numbers">
            It is a transfer
          </button>
        </span>
      </div>
      {typing && (
        <div className={styles.inlineForm}>
          <input className={styles.input} list="booking-names" placeholder="Ticker or name, e.g. TSLA" value={text}
            onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && save()} autoFocus />
          <datalist id="booking-names">
            {known.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
          <button type="button" className={styles.primaryButton} onClick={save}>Save</button>
          {b.source === "manual" && (
            <button type="button" className={styles.smallButton} onClick={() => { onLabel(b.id, null); setTyping(false); }}>
              Forget what I typed
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const BookingsList: React.FC<{
  bookings: Booking[];
  known: string[];
  onMove: (id: number, kind: BookingKind) => void;
  onLabel: (id: number, instrument: string | null) => void;
}> = ({ bookings, known, onMove, onLabel }) => {
  const open = bookings.filter((b) => b.instrument === UNKNOWN || b.instrument === MANUAL).length;
  return (
    <details className={styles.card} open={open > 0 && open <= 12}>
      <summary className={styles.summaryRow}>
        <strong>All {bookings.length} bookings</strong>
        <span className={styles.muted}>
          newest first{open > 0 ? ` · ${open} without a name: type the ticker on a buy you made by hand` : ""}
        </span>
      </summary>
      <div className={styles.list}>
        {bookings.map((b) => (
          <BookingRow key={b.id} booking={b} known={known} onMove={onMove} onLabel={onLabel} />
        ))}
      </div>
    </details>
  );
};

export const MovedOutList: React.FC<{ items: MovedOut[]; onChange: (id: number, kind: BookingKind) => void }> = ({
  items, onChange,
}) =>
  items.length === 0 ? null : (
    <details className={styles.card} open>
      <summary className={styles.summaryRow}>
        <strong>Moved out of the investments ({items.length})</strong>
        <span className={styles.muted}>you marked these as transfers between your own accounts</span>
      </summary>
      <div className={styles.list}>
        {items.map((m) => (
          <div key={m.id} className={styles.listRow}>
            <span>
              {shortDate(m.date)} <span className={styles.muted}>{m.broker}: {m.text}</span>
            </span>
            <span className={styles.rowEnd}>
              {euro(m.amount)}
              <button type="button" className={styles.smallButton} onClick={() => onChange(m.id, "investment")}>
                Count as investment again
              </button>
            </span>
          </div>
        ))}
      </div>
    </details>
  );
