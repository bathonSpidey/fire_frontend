import React, { useState } from "react";
import type { MonthlyReceiptInventory } from "../types";
import styles from "../styles/MonthlyInventory.module.css";

interface ReceiptCardProps {
  receipt: MonthlyReceiptInventory;
  onItemStatusChange: (
    itemName: string,
    purchaseDate: string,
    newStatus: string,
    receiptId: number,
    itemId: number,
  ) => Promise<void>;
}

const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onItemStatusChange,
}) => {
  // Set to true if you prefer receipts open by default
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusClassName = (status: string) => {
    switch (status) {
      case "Available":
        return styles.statusAvailable;
      case "Consumed":
        return styles.statusConsumed;
      case "Spoiled":
        return styles.statusSpoiled;
      case "Discarded":
        return styles.statusDiscarded;
      default:
        return "";
    }
  };

  return (
    <div className={styles.receiptCard}>
      {/* Clickable Header Area */}
      <div
        className={styles.receiptHeaderInteractive}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
      >
        <div className={styles.headerLeft}>
          <ChevronDown
            className={`${styles.headerChevron} ${isExpanded ? styles.chevronRotated : ""}`}
          />
          <span className={styles.storeTitle}>{receipt.store_name}</span>
          <span className={styles.purchaseDate}>{receipt.purchase_date}</span>
        </div>
        <div className={styles.totalAmount}>
          {receipt.total_amount.toFixed(2)}€
        </div>
      </div>

      {/* Conditionally Rendered Items Table */}
      {isExpanded && (
        <div className={styles.tableWrapper}>
          <table className={styles.itemTable}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Storage</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 500 }}>
                    {item.name} {item.brand ? `(${item.brand})` : ""}
                  </td>
                  <td>
                    <span
                      className={styles.pill}
                      style={{ backgroundColor: "var(--surface-raised)" }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_cost.toFixed(2)}€</td>
                  <td>
                    <span
                      className={`${styles.pill} ${item.storage_condition.includes("Cool") ? styles.coolCondition : styles.normalCondition}`}
                    >
                      {item.storage_condition}
                    </span>
                  </td>
                  <td
                    style={{
                      color: item.date_expiry
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {item.date_expiry ? item.date_expiry : "—"}
                  </td>
                  {/* Prevents row status change clicks from bubbling up and collapsing the card */}
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={`${styles.statusSelect} ${getStatusClassName(item.status || "Available")}`}
                      value={item.status || "Available"}
                      onChange={(e) =>
                        onItemStatusChange(
                          item.name,
                          receipt.purchase_date,
                          e.target.value,
                          receipt.id,
                          item.id,
                        )
                      }
                    >
                      <option value="Available">Available</option>
                      <option value="Consumed">Consumed</option>
                      <option value="Spoiled">Spoiled</option>
                      <option value="Discarded">Discarded</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
