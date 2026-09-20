import React from "react";
import { useCategoryOptions } from "../hooks/useCategoryOptions";

interface Props {
  value: string | null | undefined;
  flow: "income" | "expense"; // money in takes income categories, money out expense categories
  onChange: (key: string) => void;
  disabled?: boolean;
}

// One dropdown for picking a category, grouped like the Categories page.
export const CategorySelect: React.FC<Props> = ({ value, flow, onChange, disabled }) => {
  const { options } = useCategoryOptions();
  const list = options.filter((c) => c.flow === flow);
  const groups = Array.from(new Set(list.map((c) => c.group_name)));
  const known = list.some((c) => c.key === value);

  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => e.target.value && onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      aria-label="Category"
      style={{
        maxWidth: "190px",
        padding: "3px 6px",
        fontSize: "0.8125rem",
        borderRadius: "var(--radius)",
        border: `0.5px solid ${value ? "var(--border)" : "var(--warning-border)"}`,
        backgroundColor: value ? "var(--surface)" : "var(--warning-subtle)",
        color: "var(--text-primary)",
        cursor: "pointer",
      }}
    >
      {!value && (
        <option value="" disabled>
          Uncategorized
        </option>
      )}
      {value && !known && <option value={value}>{value}</option>}
      {groups.map((group) => (
        <optgroup key={group} label={group}>
          {list
            .filter((c) => c.group_name === group)
            .map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
};
