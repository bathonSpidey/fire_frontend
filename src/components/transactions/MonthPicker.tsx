import type { MonthYear } from "../../types/api";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface MonthPickerProps {
  value: MonthYear;
  onChange: (value: MonthYear) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const { year, month } = value;
  const now = new Date();

  function prev() {
    if (month === 1) onChange({ year: year - 1, month: 12 });
    else onChange({ year, month: month - 1 });
  }

  function next() {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    // Don't go beyond current month
    if (nextYear > now.getFullYear()) return;
    if (nextYear === now.getFullYear() && nextMonth > now.getMonth() + 1)
      return;
    onChange({ year: nextYear, month: nextMonth });
  }

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "2px",
      }}
    >
      <NavBtn onClick={prev}>‹</NavBtn>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "var(--text-sm)",
          color: "var(--color-text)",
          minWidth: "100px",
          textAlign: "center",
          letterSpacing: "-0.01em",
        }}
      >
        {MONTHS[month - 1]} {year}
      </span>
      <NavBtn onClick={next} disabled={isCurrentMonth}>
        ›
      </NavBtn>
    </div>
  );
}

function NavBtn({
  children,
  onClick,
  disabled = false,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "28px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: "var(--radius-sm)",
        color: disabled ? "var(--color-text-3)" : "var(--color-text-2)",
        cursor: disabled ? "default" : "pointer",
        fontSize: "var(--text-lg)",
        transition: "background var(--duration-fast)",
      }}
    >
      {children}
    </button>
  );
}
