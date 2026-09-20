import React from "react";
import type { Booking, BookingKind, Flow, Instrument, InvestMonth, InvestYear, MovedOut } from "../types";
import { UNKNOWN } from "../types";
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
              {i.name === UNKNOWN ? <span className={styles.muted}>Not known: the bank does not say what was bought</span> : i.name}
              {i.code && <span className={styles.code}>{i.code}</span>}
            </td>
            <td>
              <strong>{euro(i.net)}</strong>
            </td>
            <td>{i.share_pct}%</td>
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

export const BookingsList: React.FC<{ bookings: Booking[]; onChange: (id: number, kind: BookingKind) => void }> = ({
  bookings, onChange,
}) => (
  <details className={styles.card}>
    <summary className={styles.summaryRow}>
      <strong>All {bookings.length} bookings</strong>
      <span className={styles.muted}>newest first. A booking that is really a transfer to your own account can be moved out.</span>
    </summary>
    <div className={styles.list}>
      {bookings.map((b) => (
        <div key={b.id} className={styles.listRow}>
          <span>
            {shortDate(b.date)}{" "}
            <span className={styles.muted}>{b.instrument === UNKNOWN ? b.description.slice(0, 60) : b.instrument}</span>
          </span>
          <span className={styles.rowEnd}>
            {b.amount < 0 ? `${euro(-b.amount)} sold` : euro(b.amount)}
            <button type="button" className={styles.smallButton} onClick={() => onChange(b.id, "internal_transfer")}
              title="It is money moved to my own account, not an investment: take it out of these numbers">
              It is a transfer
            </button>
          </span>
        </div>
      ))}
    </div>
  </details>
);

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
