import React, { useState } from "react";
import type { BankStatementResponse } from "../../statement-upload/types";
import styles from "../styles/StatementManage.module.css";

export const StatementAccordion: React.FC<{
  statement: BankStatementResponse;
}> = ({ statement }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.accordionCard}>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>
          <h3 style={{ fontWeight: 600 }}>{statement.bank} Summary</h3>
          <span
            style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
          >
            {statement.transactions.length} Transactions Found
          </span>
        </div>
        <div className={styles.headerMetrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Starting</span>
            <span className={styles.metricValue}>
              {statement.starting_balance.toFixed(2)}€
            </span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Closing</span>
            <span className={styles.metricValue}>
              {statement.closing_balance.toFixed(2)}€
            </span>
          </div>
          <span
            style={{
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "var(--transition)",
            }}
          >
            ▼
          </span>
        </div>
      </button>

      {isOpen && (
        <div className={styles.accordionContent}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {statement.transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td style={{ width: "100px" }}>{tx.date}</td>
                    <td>{tx.description}</td>
                    <td
                      style={{ textAlign: "right" }}
                      className={
                        tx.amount >= 0 ? styles.incomeRow : styles.expenseRow
                      }
                    >
                      {tx.amount >= 0
                        ? `+${tx.amount.toFixed(2)}`
                        : tx.amount.toFixed(2)}
                      €
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
