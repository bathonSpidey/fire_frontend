import React, { useState } from "react";
import type { BankStatementResponse } from "../../statement-upload/types";
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
}

export const StatementAccordion: React.FC<Props> = ({ statement }) => {
  const [isOpen, setIsOpen] = useState(false);

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
                  <th style={{ textAlign: "right" }}>Amount €</th>
                </tr>
              </thead>
              <tbody>
                {statement.transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{tx.date}</td>
                    <td>{tx.description}</td>
                    <td
                      style={{ textAlign: "right" }}
                      className={
                        tx.amount >= 0
                          ? styles.incomeAmount
                          : styles.expenseAmount
                      }
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
