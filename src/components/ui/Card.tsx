import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  accent?: boolean;
  noPadding?: boolean;
}

const base: CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-sm)",
  padding: "var(--space-6)",
  transition: "box-shadow 200ms ease, border-color 200ms ease",
};

export function Card({
  children,
  style,
  onClick,
  accent = false,
  noPadding = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        ...base,
        padding: noPadding ? 0 : "var(--space-6)",
        borderLeft: accent
          ? "3px solid var(--color-primary)"
          : "1px solid var(--color-border)",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
