import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--color-primary)",
    color: "#000",
    border: "1px solid transparent",
    fontWeight: 600,
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-2)",
    border: "1px solid transparent",
  },
  danger: {
    background: "rgba(239,68,68,0.12)",
    color: "var(--color-danger)",
    border: "1px solid rgba(239,68,68,0.2)",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text)",
    border: "1px solid var(--color-border-2)",
  },
};

const SIZE: Record<ButtonSize, CSSProperties> = {
  sm: { padding: "4px 12px", fontSize: "var(--text-xs)", height: "28px" },
  md: { padding: "6px 16px", fontSize: "var(--text-sm)", height: "36px" },
  lg: { padding: "10px 24px", fontSize: "var(--text-base)", height: "44px" },
};

export function Button({
  children,
  variant = "outline",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        borderRadius: "var(--radius-md)",
        fontFamily: "var(--font-body)",
        fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        transition:
          "opacity 150ms ease, background 150ms ease, box-shadow 150ms ease",
        width: fullWidth ? "100%" : undefined,
        whiteSpace: "nowrap",
        ...VARIANT[variant],
        ...SIZE[size],
        ...style,
      }}
      {...props}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "currentColor",
            animation: "pulse 1.2s ease infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </span>
  );
}
