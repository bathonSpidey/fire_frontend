import React, { useState } from "react";
import { REASONS } from "../types";
import type { StockItem } from "../types";
import styles from "../styles/Inventory.module.css";

export const Stars: React.FC<{ value: number | null; onChange: (rating: number | null) => void; label?: string }> = ({
  value,
  onChange,
  label = "Rating",
}) => (
  <span className={styles.stars} role="group" aria-label={label}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        className={`${styles.star} ${value !== null && n <= value ? styles.starOn : ""}`}
        onClick={() => onChange(value === n ? null : n)} // clicking the same star again clears it
        aria-label={`${n} star${n === 1 ? "" : "s"}`}
      >
        {value !== null && n <= value ? "★" : "☆"}
      </button>
    ))}
  </span>
);

const expiryLabel = (item: StockItem): string => {
  if (item.days_left === null) return "no date";
  if (item.days_left < 0) return `expired ${-item.days_left} day${item.days_left === -1 ? "" : "s"} ago`;
  if (item.days_left === 0) return "goes off today";
  if (item.days_left === 1) return "tomorrow";
  return `in ${item.days_left} days`;
};

const urgencyClass: Record<StockItem["urgency"], string> = {
  expired: styles.badgeExpired,
  soon: styles.badgeSoon,
  week: styles.badgeWeek,
  ok: "",
  none: styles.badgeMuted,
};

interface Props {
  item: StockItem;
  places: string[]; // suggestions for where it is kept
  onUseOne: () => void;
  onUsedUp: () => void;
  onOpened: () => void;
  onFreeze: () => void;
  onDiscard: (reason: string) => void;
  onUpdate: (patch: { location?: string | null; date_expiry?: string | null; rating?: number | null }) => void;
}

// One thing at home: how much is left, when it must be used, where it is, and what to do next.
export const StockRow: React.FC<Props> = ({
  item, places, onUseOne, onUsedUp, onOpened, onFreeze, onDiscard, onUpdate,
}) => {
  const [editing, setEditing] = useState<"date" | "place" | null>(null);
  const food = item.group !== "home";
  const listId = `places-${item.id}`;

  return (
    <div className={styles.row}>
      <div className={styles.rowTop}>
        <div>
          <div className={styles.name}>
            {item.name}
            {item.brand ? ` (${item.brand})` : ""}
          </div>
          <div className={styles.meta}>
            {item.category} · {item.quantity_left % 1 === 0 ? item.quantity_left : item.quantity_left.toFixed(1)} of{" "}
            {item.quantity} left · {item.value_left.toFixed(2)} € · bought {item.purchase_date} at {item.store}
          </div>
        </div>

        <div className={styles.badges}>
          {editing === "date" ? (
            <input
              type="date"
              className={styles.input}
              defaultValue={item.date_expiry ?? ""}
              autoFocus
              aria-label="Best-before date"
              onBlur={(e) => {
                const value = e.target.value || null;
                if (value !== item.date_expiry) onUpdate({ date_expiry: value });
                setEditing(null);
              }}
            />
          ) : (
            <button
              type="button"
              className={`${styles.badge} ${urgencyClass[item.urgency]}`}
              title="Click to set the real best-before date from the package"
              onClick={() => setEditing("date")}
            >
              {expiryLabel(item)}
            </button>
          )}

          {item.opened_on && (
            <span className={`${styles.badge} ${styles.badgeWeek}`} style={{ cursor: "default" }}>
              opened {item.opened_on}
            </span>
          )}

          {editing === "place" ? (
            <>
              <input
                className={styles.input}
                list={listId}
                defaultValue={item.location ?? ""}
                autoFocus
                placeholder="Where is it?"
                aria-label="Where it is kept"
                onBlur={(e) => {
                  const value = e.target.value.trim() || null;
                  if (value !== item.location) onUpdate({ location: value });
                  setEditing(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
              />
              <datalist id={listId}>
                {places.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </>
          ) : (
            <button
              type="button"
              className={`${styles.badge} ${item.location ? "" : styles.badgeMuted}`}
              title="Where it is kept in the house"
              onClick={() => setEditing("place")}
            >
              {item.location ?? "+ where is it?"}
            </button>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${styles.action} ${styles.actionMain}`} onClick={onUseOne}>
          Used 1
        </button>
        <button type="button" className={styles.action} onClick={onUsedUp}>
          Used up
        </button>
        {food && !item.opened_on && (
          <button type="button" className={styles.action} onClick={onOpened} title="Opened packages go off sooner">
            Opened
          </button>
        )}
        {food && item.group !== "freezer" && (
          <button type="button" className={styles.action} onClick={onFreeze} title="Freezing keeps it for months">
            Freeze it
          </button>
        )}
        <select
          className={styles.action}
          value=""
          aria-label="Remove it"
          onChange={(e) => e.target.value && onDiscard(e.target.value)}
        >
          <option value="">Threw it away / gave it away...</option>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <Stars value={item.rating} onChange={(rating) => onUpdate({ rating })} label={`Rate ${item.name}`} />
      </div>
    </div>
  );
};
