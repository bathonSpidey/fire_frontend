import type { CSSProperties, ReactNode } from "react";

// ── LoadingSpinner ────────────────────────────────────────────────────────────

interface SpinnerProps {
  size?: number;
  style?: CSSProperties;
}

export function LoadingSpinner({ size = 24, style }: SpinnerProps) {
  return (
    <>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "spin 0.8s linear infinite", ...style }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="var(--color-border-2)"
          strokeWidth="2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  style?: CSSProperties;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-4)",
        padding: "var(--space-16)",
        color: "var(--color-text-3)",
        textAlign: "center",
        ...style,
      }}
    >
      {icon && <span style={{ fontSize: "2.5rem", opacity: 0.5 }}>{icon}</span>}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-2)",
        }}
      >
        <p style={{ color: "var(--color-text-2)", fontWeight: 500 }}>{title}</p>
        {description && (
          <p style={{ fontSize: "var(--text-sm)" }}>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── ErrorMessage ──────────────────────────────────────────────────────────────

interface ErrorMessageProps {
  message: string;
  style?: CSSProperties;
}

export function ErrorMessage({ message, style }: ErrorMessageProps) {
  return (
    <div
      style={{
        padding: "var(--space-4)",
        borderRadius: "var(--radius-md)",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.2)",
        color: "var(--color-danger)",
        fontSize: "var(--text-sm)",
        ...style,
      }}
    >
      {message}
    </div>
  );
}
