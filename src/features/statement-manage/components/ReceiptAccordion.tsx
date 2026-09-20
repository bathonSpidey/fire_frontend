import React, { useState } from "react";
import type { MonthlyReceiptInventory } from "../../../shared/types/receipts";
import { CategorySelect } from "../../../shared/components/CategorySelect";
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
  receipt: MonthlyReceiptInventory;
  onItemCategoryChange: (itemId: number, receiptId: number, category: string) => Promise<void>;
}

const euro = (value: number): string =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

// One receipt with its items; every item's category can be changed right here.
export const ReceiptAccordion: React.FC<Props> = ({ receipt, onItemCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const flagged = receipt.status === "needs_review";

  return (
    <div className={styles.accordionCard}>
      <button
        className={styles.accordionHeader}
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <div className={styles.accordionMeta}>
          <span className={styles.accordionTitle}>
            {receipt.store_name} <span style={{ fontWeight: 400, opacity: 0.7 }}>{receipt.purchase_date}</span>
          </span>
          <span className={styles.accordionSub}>
            {receipt.items.length} items
            {receipt.owner ? ` · ${receipt.owner}` : ""}
            {receipt.bank_statement_linked ? " · matched to a bank booking" : " · not on a bank statement yet"}
            {flagged ? " · please check the date" : ""}
          </span>
        </div>
        <div className={styles.accordionRight}>
          <div className={styles.headerMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Total</span>
              <span className={styles.metricValue}>{euro(receipt.total_amount)}</span>
            </div>
          </div>
          <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>
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
                  <th>Item</th>
                  <th style={{ width: "50px" }}>Qty</th>
                  <th style={{ width: "200px" }}>Category</th>
                  <th style={{ textAlign: "right" }}>Amount €</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => {
                  const amount = item.quantity * item.unit_cost - (item.discount ?? 0);
                  return (
                    <tr key={item.id}>
                      <td>
                        {item.name}
                        {item.brand ? ` (${item.brand})` : ""}
                      </td>
                      <td>{item.quantity}</td>
                      <td>
                        <CategorySelect
                          value={item.spend_category}
                          flow="expense"
                          onChange={(key) => onItemCategoryChange(item.id, receipt.id, key)}
                        />
                      </td>
                      <td style={{ textAlign: "right" }} className={amount < 0 ? styles.incomeAmount : styles.expenseAmount}>
                        {amount.toFixed(2)}
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
