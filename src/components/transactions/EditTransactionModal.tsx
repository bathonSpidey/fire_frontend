import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi } from "../../api/transactions";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/Feedback";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../../types/api";
import type {
  Transaction,
  TransactionCategory,
  TransactionType,
} from "../../types/api";

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function EditTransactionModal({
  transaction,
  onClose,
}: EditTransactionModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.transaction_type,
    category: transaction.category,
    merchant: transaction.merchant ?? "",
    notes: transaction.notes ?? "",
  });

  const patchMutation = useMutation({
    mutationFn: () =>
      transactionsApi.patch(transaction.id, {
        description: form.description,
        amount: form.amount,
        transaction_type: form.type,
        category: form.category,
        merchant: form.merchant || null,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => transactionsApi.delete(transaction.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
  });

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "var(--space-4)",
      }}
    >
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-6)",
          width: "100%",
          maxWidth: "480px",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 700,
            }}
          >
            Edit transaction
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-3)",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Description */}
        <Field label="Description">
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inputStyle}
          />
        </Field>

        {/* Amount + Type */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-3)",
          }}
        >
          <Field label="Amount (€)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              style={inputStyle}
            />
          </Field>
          <Field label="Type">
            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value as TransactionType })
              }
              style={inputStyle}
            >
              <option value="debit">Debit (expense)</option>
              <option value="credit">Credit (income)</option>
            </select>
          </Field>
        </div>

        {/* Category */}
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value as TransactionCategory,
              })
            }
            style={inputStyle}
          >
            {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(
              (cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                </option>
              ),
            )}
          </select>
        </Field>

        {/* Merchant */}
        <Field label="Merchant (optional)">
          <input
            value={form.merchant}
            onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            placeholder="e.g. Kaufland"
            style={inputStyle}
          />
        </Field>

        {/* Notes */}
        <Field label="Notes (optional)">
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional notes"
            style={inputStyle}
          />
        </Field>

        {(patchMutation.isError || deleteMutation.isError) && (
          <ErrorMessage message="Something went wrong. Try again." />
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: "var(--space-3)",
            marginTop: "var(--space-2)",
          }}
        >
          <Button
            variant="primary"
            fullWidth
            onClick={() => patchMutation.mutate()}
            loading={patchMutation.isPending}
          >
            Save changes
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            loading={deleteMutation.isPending}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      <label
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-3)",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "var(--space-2) var(--space-3)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-2)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-sm)",
  outline: "none",
  width: "100%",
};
