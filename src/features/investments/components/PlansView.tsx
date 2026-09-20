import React, { useState } from "react";
import { usePlans } from "../hooks/usePlans";
import { euro, shortDate } from "../lib/format";
import type { Broker, Frequency, Plan, PlanInput } from "../types";
import styles from "../styles/Investments.module.css";

const BROKER_CHOICES: Broker[] = ["N26", "Commerzbank", "Sparkasse"];
const FREQUENCY_CHOICES: { value: Frequency; label: string }[] = [
  { value: "biweekly", label: "Every two weeks" },
  { value: "monthly", label: "Every month" },
  { value: "weekly", label: "Every week" },
];

const today = (): string => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

type Actions = ReturnType<typeof usePlans>;

const FrequencySelect: React.FC<{ value: Frequency; onChange: (value: Frequency) => void; label: string }> = ({
  value, onChange, label,
}) => (
  <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value as Frequency)} aria-label={label}>
    {FREQUENCY_CHOICES.map((f) => (
      <option key={f.value} value={f.value}>
        {f.label}
      </option>
    ))}
  </select>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    {children}
  </label>
);

const AddPlan: React.FC<{ actions: Actions }> = ({ actions }) => {
  const [broker, setBroker] = useState<Broker>("N26");
  const [instrument, setInstrument] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("biweekly");
  const [anchor, setAnchor] = useState("");
  const [start, setStart] = useState(today());

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input: PlanInput = {
      broker, instrument, amount: Number(amount.replace(",", ".")), frequency,
      anchor_date: anchor || null, start_date: start || null,
    };
    if (await actions.create(input)) {
      setInstrument("");
      setAmount("");
      setAnchor("");
    }
  };

  return (
    <details className={styles.card}>
      <summary className={styles.summaryRow}>
        <strong>Add a plan</strong>
        <span className={styles.muted}>a new savings plan you set up at your broker</span>
      </summary>
      <form className={styles.form} onSubmit={submit}>
        <Field label="Broker">
          <select className={styles.select} value={broker} onChange={(e) => setBroker(e.target.value as Broker)}>
            {BROKER_CHOICES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="What it buys (ticker or name)">
          <input className={styles.input} list="plan-names" value={instrument} onChange={(e) => setInstrument(e.target.value)} required />
        </Field>
        <Field label="Amount (EUR)">
          <input className={styles.input} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </Field>
        <Field label="How often">
          <FrequencySelect value={frequency} onChange={setFrequency} label="How often" />
        </Field>
        <Field label="A day it executes (optional)">
          <input className={styles.input} type="date" value={anchor} onChange={(e) => setAnchor(e.target.value)} />
        </Field>
        <Field label="Running since">
          <input className={styles.input} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </Field>
        <button type="submit" className={styles.primaryButton}>
          Add plan
        </button>
      </form>
    </details>
  );
};

type Mode = null | "correct" | "change" | "suspend" | "resume" | "delete";

const PlanRow: React.FC<{ plan: Plan; actions: Actions }> = ({ plan, actions }) => {
  const [mode, setMode] = useState<Mode>(null);
  const [instrument, setInstrument] = useState(plan.instrument);
  const [amount, setAmount] = useState(String(plan.amount));
  const [frequency, setFrequency] = useState<Frequency>(plan.frequency);
  const [day, setDay] = useState(today());
  const [anchor, setAnchor] = useState(plan.anchor_date ?? "");
  const [start, setStart] = useState(plan.start_date ?? "");
  const ended = plan.status === "ended";

  const done = (ok: boolean) => ok && setMode(null);
  const number = (text: string) => Number(text.replace(",", "."));

  return (
    <div className={styles.planRow}>
      <div className={styles.rowTop}>
        <div>
          <strong>{plan.instrument}</strong>{" "}
          <span className={styles.badge}>{plan.broker}</span>
          {plan.status !== "active" && (
            <span className={styles.badge}>{plan.status === "scheduled" ? `starts ${shortDate(plan.start_date ?? "")}` : `ended ${shortDate(plan.end_date ?? "")}`}</span>
          )}
          <div className={styles.muted}>
            {euro(plan.amount)} {plan.frequency_label.toLowerCase()} · {euro(plan.per_month)} per month
            {plan.start_date && plan.status !== "scheduled" ? ` · since ${shortDate(plan.start_date)}` : ""}
          </div>
        </div>
        {!ended && (
          <div className={styles.nextDates}>
            {plan.next_dates.length > 0 ? (
              <>
                <span className={styles.muted}>Next</span> {plan.next_dates.map(shortDate).join(", ")}
              </>
            ) : (
              <label className={styles.inline}>
                <span className={styles.muted}>Next execution (from the app)</span>
                <input className={styles.input} type="date" value={anchor} onChange={(e) => setAnchor(e.target.value)} />
                <button type="button" className={styles.smallButton} disabled={!anchor}
                  onClick={() => actions.correct(plan.id, { anchor_date: anchor })}>
                  Save
                </button>
              </label>
            )}
          </div>
        )}
      </div>

      <div className={styles.rowActions}>
        {!ended && (
          <>
            <button type="button" className={styles.smallButton} onClick={() => setMode(mode === "change" ? null : "change")}>Change from a date</button>
            <button type="button" className={styles.smallButton} onClick={() => setMode(mode === "suspend" ? null : "suspend")}>Suspend</button>
          </>
        )}
        {ended && <button type="button" className={styles.smallButton} onClick={() => setMode(mode === "resume" ? null : "resume")}>Resume</button>}
        <button type="button" className={styles.smallButton} onClick={() => setMode(mode === "correct" ? null : "correct")}>Correct a mistake</button>
        <button type="button" className={styles.smallButton} onClick={() => setMode(mode === "delete" ? null : "delete")}>Delete</button>
      </div>

      {mode === "change" && (
        <div className={styles.form}>
          <Field label="From this day">
            <input className={styles.input} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </Field>
          <Field label="Buys">
            <input className={styles.input} list="plan-names" value={instrument} onChange={(e) => setInstrument(e.target.value)} />
          </Field>
          <Field label="Amount (EUR)">
            <input className={styles.input} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="How often">
            <FrequencySelect value={frequency} onChange={setFrequency} label="How often" />
          </Field>
          <button type="button" className={styles.primaryButton}
            onClick={async () => done(await actions.change(plan.id, {
              from_date: day, amount: number(amount), frequency, instrument,
            }))}>
            Change from that day
          </button>
          <span className={styles.hint}>The old plan ends the day before, so the past stays as it was. A new rhythm needs a new execution day.</span>
        </div>
      )}

      {mode === "suspend" && (
        <div className={styles.form}>
          <Field label="No more buys from this day">
            <input className={styles.input} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </Field>
          <button type="button" className={styles.primaryButton} onClick={async () => done(await actions.suspend(plan.id, day))}>
            Suspend the plan
          </button>
        </div>
      )}

      {mode === "resume" && (
        <div className={styles.form}>
          <Field label="Running again from">
            <input className={styles.input} type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </Field>
          <button type="button" className={styles.primaryButton} onClick={async () => done(await actions.resume(plan.id, day))}>
            Resume the plan
          </button>
          <span className={styles.hint}>It starts as a new entry, so the pause stays visible in the history.</span>
        </div>
      )}

      {mode === "correct" && (
        <div className={styles.form}>
          <Field label="Buys">
            <input className={styles.input} list="plan-names" value={instrument} onChange={(e) => setInstrument(e.target.value)} />
          </Field>
          <Field label="Amount (EUR)">
            <input className={styles.input} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="How often">
            <FrequencySelect value={frequency} onChange={setFrequency} label="How often" />
          </Field>
          <Field label="A day it executes">
            <input className={styles.input} type="date" value={anchor} onChange={(e) => setAnchor(e.target.value)} />
          </Field>
          <Field label="Running since">
            <input className={styles.input} type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <button type="button" className={styles.primaryButton}
            onClick={async () => done(await actions.correct(plan.id, {
              instrument, amount: number(amount), frequency, anchor_date: anchor || null, start_date: start || null,
            }))}>
            Save the correction
          </button>
          <span className={styles.hint}>This rewrites the plan as entered (a typo, a wrong date). To change what is true from now on, use "Change from a date".</span>
        </div>
      )}

      {mode === "delete" && (
        <div className={styles.form}>
          <span className={styles.hint}>Delete only a plan that was entered by mistake. For one that really ran, use Suspend so its history stays.</span>
          <button type="button" className={styles.dangerButton} onClick={async () => done(await actions.remove(plan.id))}>
            Yes, delete it
          </button>
        </div>
      )}
    </div>
  );
};

export const PlansView: React.FC = () => {
  const actions = usePlans();
  const { data, error, loading } = actions;

  if (!data) return error ? <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div> : <div className={styles.empty}>{loading ? "Loading..." : ""}</div>;

  const running = data.plans.filter((p) => p.status !== "ended");
  const history = data.plans.filter((p) => p.status === "ended");
  const withoutDay = running.filter((p) => p.status === "active" && !p.anchor_date).length;
  const byBroker = Object.entries(data.summary.per_month_by_broker);

  return (
    <>
      <div className={styles.hero}>
        <span className={styles.heroLabel}>Planned per month</span>
        <span className={styles.heroValue}>{euro(data.summary.per_month)}</span>
        <span className={styles.heroSub}>
          {data.summary.active} active {data.summary.active === 1 ? "plan" : "plans"}
          {byBroker.length > 1 && ` · ${byBroker.map(([b, v]) => `${b} ${euro(v)}`).join(" · ")}`}
          {" · fortnightly plans count 26 times a year, so an average month has a little more than two"}
        </span>
      </div>

      {error && <div className={`${styles.notice} ${styles.noticeError}`}>{error}</div>}

      {withoutDay > 0 && (
        <div className={`${styles.card} ${styles.cardWarn}`}>
          <strong>
            {withoutDay} {withoutDay === 1 ? "plan has" : "plans have"} no execution day yet
          </strong>
          <span className={styles.hint}>
            Open a plan in your N26 app and read off its next execution date, then enter it below. With that one date
            every buy on your statement can be matched to exactly one plan. Without it, several plans with the same
            amount (for example the 10 € ones) cannot be told apart.
          </span>
        </div>
      )}

      <datalist id="plan-names">
        {data.instruments.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <AddPlan actions={actions} />

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Running plans</h2>
        {running.length === 0 ? (
          <span className={styles.hint}>No plans yet. Add the savings plans you run, and buys on your statements get their names.</span>
        ) : (
          running.map((p) => <PlanRow key={p.id} plan={p} actions={actions} />)
        )}
      </div>

      {history.length > 0 && (
        <details className={styles.card}>
          <summary className={styles.summaryRow}>
            <strong>History ({history.length})</strong>
            <span className={styles.muted}>plans that ended or were replaced by a change</span>
          </summary>
          {history.map((p) => (
            <PlanRow key={p.id} plan={p} actions={actions} />
          ))}
        </details>
      )}
    </>
  );
};
