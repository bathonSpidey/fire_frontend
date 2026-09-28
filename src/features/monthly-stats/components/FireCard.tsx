import React, { useState } from "react";
import { useFire } from "../hooks/useFire";
import type { FireAdjustment } from "../types";
import styles from "../styles/MonthlyStats.module.css";

const euro0 = (value: number): string =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const euro2 = (value: number): string =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

type Actions = ReturnType<typeof useFire>;

const RATE_PRESETS = [
  { value: 0.04, label: "4% (25× spend)" },
  { value: 0.035, label: "3.5% (~28.6× spend)" },
  { value: 0.03, label: "3% (~33× spend)" },
];

// The target and rate the household set for itself. Editable any time — nothing here is guessed.
const SettingsForm: React.FC<{ actions: Actions; initial?: { target_monthly_spend: number; withdrawal_rate: number } }> = ({
  actions, initial,
}) => {
  const [target, setTarget] = useState(String(initial?.target_monthly_spend ?? ""));
  const [rate, setRate] = useState(String(initial?.withdrawal_rate ?? 0.035));
  const [customRate, setCustomRate] = useState(!RATE_PRESETS.some((p) => p.value === initial?.withdrawal_rate));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const t = Number(target.replace(",", "."));
    const r = Number(rate.replace(",", "."));
    if (t > 0 && r > 0) await actions.setTarget(t, r);
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Target monthly spend (the simple life, steady-state)</span>
        <input className={styles.textInput} inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} required />
      </div>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Withdrawal rate per year</span>
        {customRate ? (
          <input className={styles.textInput} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} required />
        ) : (
          <select className={styles.select} value={rate} onChange={(e) => (e.target.value === "custom" ? setCustomRate(true) : setRate(e.target.value))}>
            {RATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
            <option value="custom">Custom...</option>
          </select>
        )}
      </div>
      <button type="submit" className={styles.primaryButton}>
        {initial ? "Save" : "Set target"}
      </button>
    </form>
  );
};

const AddAdjustment: React.FC<{ actions: Actions }> = ({ actions }) => {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const a = Number(amount.replace(",", "."));
    if (!label.trim() || Number.isNaN(a)) return;
    if (await actions.addAdjustment(label.trim(), a, note.trim() || undefined)) {
      setLabel("");
      setAmount("");
      setNote("");
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>What (an account nobody has uploaded yet, a known gap)</span>
        <input className={styles.textInput} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Lena's savings" required />
      </div>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Amount (EUR, negative for a debt)</span>
        <input className={styles.textInput} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Note (optional)</span>
        <input className={styles.textInput} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. remove once tracked" />
      </div>
      <button type="submit" className={styles.primaryButton}>
        Add
      </button>
    </form>
  );
};

const AdjustmentRow: React.FC<{ item: FireAdjustment; actions: Actions }> = ({ item, actions }) => {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(item.amount));

  return (
    <div className={styles.adjustmentRow}>
      <span>
        {item.label}
        {item.note && <span className={styles.fireSub}> — {item.note}</span>}
      </span>
      {editing ? (
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            className={styles.textInput}
            style={{ width: 110 }}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            type="button"
            className={styles.smallButton}
            onClick={async () => {
              const a = Number(amount.replace(",", "."));
              if (!Number.isNaN(a) && (await actions.updateAdjustment(item.id, { amount: a }))) setEditing(false);
            }}
          >
            Save
          </button>
        </span>
      ) : (
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <strong>{euro2(item.amount)}</strong>
          <button type="button" className={styles.smallButton} onClick={() => setEditing(true)}>
            Edit
          </button>
          <button type="button" className={styles.smallButton} onClick={() => actions.deleteAdjustment(item.id)}>
            Remove
          </button>
        </span>
      )}
    </div>
  );
};

export const FireCard: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const actions = useFire(refreshKey);
  const { data, loading, error } = actions;
  const [editingTarget, setEditingTarget] = useState(false);

  if (loading && !data) return null;
  if (!data) return error ? <div className={styles.fireCard}>{error}</div> : null;

  if (!data.settings) {
    return (
      <div className={styles.fireCard}>
        <h2 className={styles.fireValue} style={{ fontSize: "1.1rem" }}>
          What does financial freedom look like for your household?
        </h2>
        <p className={styles.fireSub}>
          Set the monthly cost of the life you actually want — not today's spending, the steady-state simple life — and a
          withdrawal rate, and this turns into your household's FIRE number.
        </p>
        {error && <div className={styles.fireSub}>{error}</div>}
        <SettingsForm actions={actions} />
      </div>
    );
  }

  const { fire_number, progress_pct, combined_net_worth, years_to_fire, pace, adjustments } = data;
  const pct = Math.max(0, Math.min(100, progress_pct ?? 0));

  return (
    <div className={styles.fireCard}>
      <div className={styles.fireHead}>
        <div>
          <span className={styles.label}>Household FIRE number</span>
          <div className={styles.fireValue}>{euro0(fire_number ?? 0)}</div>
        </div>
        <button type="button" className={styles.smallButton} onClick={() => setEditingTarget(!editingTarget)}>
          Adjust
        </button>
      </div>

      <div className={styles.fireProgressTrack}>
        <div className={styles.fireProgressFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.fireSub}>
        {progress_pct ?? 0}% there — {euro0(combined_net_worth)} of {euro0(fire_number ?? 0)}
        {adjustments.length > 0 && ` (includes ${euro0(data.adjustments_total)} added by hand: ${adjustments.map((a) => a.label).join(", ")})`}
      </span>

      {years_to_fire !== null ? (
        <span className={styles.fireSub}>
          At the current pace ({euro2(pace.monthly_average ?? 0)}/month, averaged over the last {pace.months_used} finished
          {pace.months_used === 1 ? " month" : " months"}) that is roughly <strong>{years_to_fire}</strong>{" "}
          {years_to_fire === 1 ? "year" : "years"} away — assuming no investment growth at all, so likely sooner in reality.
        </span>
      ) : pace.monthly_average !== null && pace.monthly_average <= 0 ? (
        <span className={styles.fireSub}>Recent months spent more than they saved, so no time estimate can be given right now.</span>
      ) : (
        <span className={styles.fireSub}>Not enough finished months with a statement yet to estimate a pace.</span>
      )}

      {error && <div className={styles.fireSub}>{error}</div>}

      {editingTarget && (
        <>
          <SettingsForm actions={actions} initial={data.settings} />
          <details className={styles.fireCard} style={{ padding: 0, border: "none", background: "transparent" }}>
            <summary className={styles.summaryRow}>
              <strong style={{ color: "var(--text-primary)" }}>
                Untracked money ({adjustments.length})
              </strong>
              <span>added by hand, for accounts no statement covers yet</span>
            </summary>
            {adjustments.map((item) => (
              <AdjustmentRow key={item.id} item={item} actions={actions} />
            ))}
            <AddAdjustment actions={actions} />
          </details>
        </>
      )}
    </div>
  );
};
