import React, { useState } from "react";
import type { BankStatementResponse } from "../../statement-upload/types";
import { CategorySelect } from "../../../shared/components/CategorySelect";
import { useCategoryOptions } from "../../../shared/hooks/useCategoryOptions";
import styles from "../styles/StatementManage.module.css";

const ChevronDown: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface Props {
  statement: BankStatementResponse;
  onCategoryChange: (txId: number, category: string) => Promise<void>;
}

export const StatementAccordion: React.FC<Props> = ({ statement, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { byKey } = useCategoryOptions();

  const balanceDelta = statement.closing_balance - statement.starting_balance;
  const closingClass =
    balanceDelta > 0
      ? styles.metricValuePositive
      : balanceDelta < 0
        ? styles.metricValueNegative
        : "";

  return (
    <div className={styles.accordionCard}>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <div className={styles.accordionMeta}>
          <span className={styles.accordionTitle}>{statement.bank}</span>
          <span className={styles.accordionSub}>
            {statement.transactions.length} transactions
          </span>
        </div>

        <div className={styles.accordionRight}>
          <div className={styles.headerMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Starting</span>
              <span className={styles.metricValue}>
                {statement.starting_balance.toFixed(2)} €
              </span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Closing</span>
              <span className={`${styles.metricValue} ${closingClass}`}>
                {statement.closing_balance.toFixed(2)} €
              </span>
            </div>
          </div>

          <span
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          >
            <ChevronDown />
          </span>
        </div>
      </button>

      {isOpen && (
        <div className={styles.accordionContent}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>Date</th>
                  <th>Description</th>
                  <th style={{ width: "200px" }}>Category</th>
                  <th style={{ textAlign: "right" }}>Amount €</th>
                </tr>
              </thead>
              <tbody>
                {statement.transactions.map((tx, idx) => {
                  // Own money moving between accounts is neither income nor spending.
                  const isTransfer = tx.kind === "internal_transfer";
                  // A PayPal row explained by a bank booking is the same money: shown, but not counted.
                  const isDetail = tx.mirror_of != null;
                  const tag = isDetail
                    ? "PayPal detail (counted on the bank booking)"
                    : isTransfer
                    ? tx.transfer_group
                      ? "Transfer (matched)"
                      : "Transfer (other side not uploaded yet)"
                    : tx.kind === "investment"
                      ? "Investment"
                      : null;
                  return (
                  <tr key={idx}>
                    <td>{tx.date}</td>
                    <td>
                      {tag && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, marginRight: "8px", opacity: 0.7 }}>
                          [{tag}]
                        </span>
                      )}
                      {tx.description}
                    </td>
                    <td>
                      {tx.id == null || isTransfer || tx.kind === "investment" ? (
                        <span style={{ opacity: 0.5 }}>—</span>
                      ) : isDetail ? (
                        <span style={{ opacity: 0.6 }} title="Counted on the bank booking, change it there">
                          {(tx.category && byKey.get(tx.category)?.label) || "—"}
                        </span>
                      ) : (
                        <CategorySelect
                          value={tx.category}
                          flow={tx.kind === "income" || tx.kind === "refund" || tx.amount > 0 ? "income" : "expense"}
                          onChange={(key) => onCategoryChange(tx.id as number, key)}
                        />
                      )}
                    </td>
                    <td
                      style={{ textAlign: "right", opacity: isTransfer || isDetail ? 0.6 : 1 }}
                      className={
                        isTransfer || isDetail || tx.kind === "investment"
                          ? undefined
                          : tx.amount >= 0
                            ? styles.incomeAmount
                            : styles.expenseAmount
                      }
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount.toFixed(2)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
