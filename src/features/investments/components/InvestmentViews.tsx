import React from "react";
import { euro, monthYear, shortDate } from "../lib/format";
import { brokerColor, chartColors, useDarkMode } from "../lib/palette";
import type { BookingKind, InvestmentSummary } from "../types";
import { UNKNOWN } from "../types";
import { CumulativeChart, MonthlyChart } from "./InvestmentCharts";
import { BookingsList, FlowList, InstrumentsTable, MonthsTable, MovedOutList, YearsTable } from "./InvestmentTables";
import styles from "../styles/Investments.module.css";

const Tile: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({ label, value, sub, color }) => (
  <div className={styles.tile}>
    <span className={styles.tileLabel}>
      {color && <span className={styles.dot} style={{ background: color }} />}
      {label}
    </span>
    <span className={styles.tileValue}>{value}</span>
    {sub && <span className={styles.tileSub}>{sub}</span>}
  </div>
);

const Hero: React.FC<{ label: string; data: InvestmentSummary }> = ({ label, data }) => (
  <div className={styles.hero}>
    <span className={styles.heroLabel}>{label}</span>
    <span className={styles.heroValue}>{euro(data.totals.net)}</span>
    <span className={styles.heroSub}>
      {data.totals.first_date && data.totals.last_date
        ? `Since ${monthYear(data.totals.first_date)} · ${data.totals.bookings} ${data.totals.bookings === 1 ? "booking" : "bookings"}, the latest on ${shortDate(data.totals.last_date)}`
        : "Nothing invested yet"}
      {data.totals.sold > 0 && ` · includes ${euro(data.totals.sold)} that came back from sells`}
    </span>
  </div>
);

const Chart: React.FC<{ title: string; hint?: string; children: React.ReactNode }> = ({ title, hint, children }) => (
  <div className={styles.card}>
    <div className={styles.cardHead}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
    {children}
  </div>
);

const NOT_UPLOADED = "Faded months: no statement uploaded yet. That is not the same as nothing invested.";

type Change = (id: number, kind: BookingKind) => void;

export const OverviewView: React.FC<{ data: InvestmentSummary; onChange: Change }> = ({ data, onChange }) => {
  const colors = chartColors(useDarkMode());
  if (data.totals.bookings === 0) {
    return (
      <>
        <div className={styles.empty}>
          No investments found yet. Upload the N26 and Commerzbank statements and every buy shows up here.
        </div>
        <MovedOutList items={data.moved_out} onChange={onChange} />
      </>
    );
  }
  return (
    <>
      <Hero label="Invested so far" data={data} />
      <div className={styles.tiles}>
        <Tile label="This year" value={euro(data.totals.this_year)} />
        <Tile
          label="Per month"
          value={euro(data.totals.avg_per_month_12)}
          sub="Each broker over its own months with a statement, added up"
        />
        {data.brokers.map((b) => (
          <Tile
            key={b.broker}
            label={b.broker}
            color={brokerColor(colors, b.broker)}
            value={euro(b.net)}
            sub={b.bookings === 0 ? "Nothing yet" : `${b.bookings} ${b.bookings === 1 ? "booking" : "bookings"}`}
          />
        ))}
      </div>

      <Chart title="Invested over time" hint="Running total">
        <CumulativeChart months={data.months} />
        <span className={styles.hint}>{NOT_UPLOADED}</span>
      </Chart>

      <Chart title="Invested per month" hint="By broker">
        <MonthlyChart months={data.months} by="broker" />
        <span className={styles.hint}>{NOT_UPLOADED}</span>
        <details>
          <summary className={styles.hint}>Show as a table</summary>
          <MonthsTable months={data.months} />
        </details>
      </Chart>

      <Chart title="By year">
        <YearsTable years={data.years} />
      </Chart>

      <div className={styles.two}>
        <FlowList title="Costs on the depots" hint="account fees and taxes, not invested" total={data.costs.total} items={data.costs.items} />
        <FlowList title="Dividends and refunds" hint="paid out to you, not invested" total={data.received.total} items={data.received.items} />
      </div>
      <MovedOutList items={data.moved_out} onChange={onChange} />
    </>
  );
};

export const BrokerView: React.FC<{ data: InvestmentSummary; broker: string; onChange: Change }> = ({
  data, broker, onChange,
}) => {
  if (data.totals.bookings === 0) {
    return (
      <>
        <div className={styles.empty}>
          No investment bookings for {broker} yet. Upload its statements and the buys show up here.
        </div>
        <MovedOutList items={data.moved_out} onChange={onChange} />
      </>
    );
  }
  const buys = data.bookings.filter((b) => b.amount > 0).length;
  return (
    <>
      <Hero label={`Invested with ${broker}`} data={data} />
      <div className={styles.tiles}>
        <Tile label="This year" value={euro(data.totals.this_year)} />
        <Tile label="Per month" value={euro(data.totals.avg_per_month_12)} sub="Over months with a statement" />
        <Tile label="Buys" value={String(buys)} sub={data.totals.sold > 0 ? `and ${data.bookings.length - buys} sells` : undefined} />
        {data.received.total > 0 && <Tile label="Dividends and refunds" value={euro(data.received.total)} sub="Paid out, not invested" />}
        {data.costs.total > 0 && <Tile label="Depot costs" value={euro(data.costs.total)} sub="Fees and taxes, not invested" />}
      </div>

      {data.unknown.count > 0 && (
        <div className={styles.card}>
          <strong>
            {euro(data.unknown.net)} in {data.unknown.count} {data.unknown.count === 1 ? "booking" : "bookings"} has no instrument
          </strong>
          <span className={styles.hint}>
            {broker} does not say what these bought, only the amount. The totals are right; the split by instrument is
            not known yet.
          </span>
        </div>
      )}

      <Chart title="Invested over time" hint="Running total">
        <CumulativeChart months={data.months} />
        <span className={styles.hint}>{NOT_UPLOADED}</span>
      </Chart>

      <Chart title="Invested per month" hint={data.instruments.some((i) => i.name !== UNKNOWN) ? "By instrument" : undefined}>
        <MonthlyChart months={data.months} by="instrument" instruments={data.instruments} />
        <span className={styles.hint}>{NOT_UPLOADED}</span>
        <details>
          <summary className={styles.hint}>Show as a table</summary>
          <MonthsTable months={data.months} />
        </details>
      </Chart>

      <Chart title="What it went into">
        <InstrumentsTable instruments={data.instruments} />
      </Chart>

      <Chart title="By year">
        <YearsTable years={data.years} />
      </Chart>

      <FlowList title="Costs" hint="account fees and taxes, not invested" total={data.costs.total} items={data.costs.items} />
      <FlowList title="Dividends and refunds" hint="paid out to you, not invested" total={data.received.total} items={data.received.items} />
      <BookingsList bookings={data.bookings} onChange={onChange} />
      <MovedOutList items={data.moved_out} onChange={onChange} />
    </>
  );
};
