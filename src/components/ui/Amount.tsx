import type { CSSProperties } from "react";
import type { TransactionType } from "../../types/api";

interface AmountProps {
  value: string | number;
  type?: TransactionType;
  size?: "sm" | "md" | "lg" | "xl";
  showSign?: boolean;
  currency?: string;
  style?: CSSProperties;
}

const SIZE_STYLES: Record<string, CSSProperties> = {
  sm: { fontSize: "var(--text-sm)" },
  md: { fontSize: "var(--text-base)" },
  lg: { fontSize: "var(--text-xl)" },
  xl: { fontSize: "var(--text-3xl)" },
};

export function Amount({
  value,
  type,
  size = "md",
  showSign = false,
  currency = "€",
  style,
}: AmountProps) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  const isCredit = type === "credit";
  const isDebit = type === "debit";

  const color = isCredit
    ? "var(--color-success)"
    : isDebit
      ? "var(--color-danger)"
      : "var(--color-text)";

  const sign = showSign ? (isCredit ? "+" : isDebit ? "-" : "") : "";
  const formatted = num.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        color,
        ...SIZE_STYLES[size],
        ...style,
      }}
    >
      {sign}
      {currency}
      {formatted}
    </span>
  );
}
