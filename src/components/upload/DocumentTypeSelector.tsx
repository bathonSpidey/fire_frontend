import type { DocumentType } from "../../types/api";

interface Option {
  value: DocumentType;
  label: string;
  icon: string;
  description: string;
}

const OPTIONS: Option[] = [
  {
    value: "bank_statement",
    label: "Bank Statement",
    icon: "🏦",
    description: "Monthly Kontoauszug PDF",
  },
  {
    value: "receipt",
    label: "Receipt",
    icon: "🧾",
    description: "Supermarket or store receipt",
  },
  {
    value: "investment_statement",
    label: "Investment",
    icon: "📈",
    description: "Depot or fund statement",
  },
  {
    value: "unknown",
    label: "Other",
    icon: "📄",
    description: "Let FIRE detect the type",
  },
];

interface DocumentTypeSelectorProps {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
}

export function DocumentTypeSelector({
  value,
  onChange,
}: DocumentTypeSelectorProps) {
  return (
    <div>
      <p
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: 500,
          color: "var(--color-text-2)",
          marginBottom: "var(--space-3)",
        }}
      >
        Document type
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-2)",
        }}
      >
        {OPTIONS.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
                background: selected
                  ? "rgba(245,158,11,0.08)"
                  : "var(--color-surface-2)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--duration-fast) var(--ease-out)",
              }}
            >
              <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                {opt.icon}
              </span>
              <div>
                <p
                  style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: selected ? 600 : 400,
                    color: selected
                      ? "var(--color-primary)"
                      : "var(--color-text)",
                  }}
                >
                  {opt.label}
                </p>
                <p
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--color-text-3)",
                  }}
                >
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
