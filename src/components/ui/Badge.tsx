import type { CSSProperties, ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  style?: CSSProperties;
}

const VARIANT_STYLES: Record<BadgeVariant, CSSProperties> = {
  default: {
    background: "var(--color-surface-2)",
    color: "var(--color-text-2)",
  },
  success: {
    background: "rgba(16,185,129,0.12)",
    color: "var(--color-success)",
  },
  danger: { background: "rgba(239,68,68,0.12)", color: "var(--color-danger)" },
  warning: {
    background: "rgba(245,158,11,0.12)",
    color: "var(--color-primary)",
  },
  info: { background: "rgba(59,130,246,0.12)", color: "var(--color-info)" },
  muted: { background: "transparent", color: "var(--color-text-3)" },
};

export function Badge({ children, variant = "default", style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        padding: "2px 8px",
        borderRadius: "999px",
        fontSize: "var(--text-xs)",
        fontFamily: "var(--font-mono)",
        fontWeight: 500,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
