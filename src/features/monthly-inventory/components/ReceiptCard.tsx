import React, { useState } from "react";
import type { MonthlyReceiptInventory, InventoryItem } from "../types";
import styles from "../styles/MonthlyInventory.module.css";

const ChevronDown: React.FC = () => (
  <svg
    width="14"
    height="14"
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

const SeparatorChevron: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

interface ItemRowProps {
  item: InventoryItem;
}

const ItemRow: React.FC<ItemRowProps> = ({ item }) => {
  const isCool =
    item.storage_condition.toLowerCase().includes("cool") ||
    item.storage_condition.toLowerCase().includes("fridge") ||
    item.storage_condition.toLowerCase().includes("refrig");

  return (
    <tr className={styles.itemRow}>
      <td className={styles.itemNameCell}>
        <span className={styles.itemName}>{item.name}</span>
        {item.brand && <span className={styles.itemBrand}>{item.brand}</span>}
      </td>
      <td>
        <span className={styles.pill}>{item.category}</span>
      </td>
      <td className={styles.cellMuted}>{item.quantity}</td>
      <td className={styles.cellMuted}>{item.unit_cost.toFixed(2)} €</td>
      <td>
        <span
          className={`${styles.pill} ${isCool ? styles.coolCondition : styles.normalCondition}`}
        >
          {item.storage_condition}
        </span>
      </td>
      <td className={item.date_expiry ? styles.cellPrimary : styles.cellMuted}>
        {item.date_expiry ?? "—"}
      </td>
    </tr>
  );
};

interface ReceiptCardProps {
  receipt: MonthlyReceiptInventory;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({ receipt }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.receiptCard}>
      <button
        className={styles.receiptHeader}
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        <div className={styles.receiptHeaderLeft}>
          <span className={styles.storeTitle}>{receipt.store_name}</span>
          <span className={styles.receiptDate}>
            <SeparatorChevron />
            {receipt.purchase_date}
          </span>
          {receipt.bank_statement_linked && (
            <span className={styles.linkedBadge}>Linked</span>
          )}
        </div>
        <div className={styles.receiptTotal}>
          {receipt.total_amount.toFixed(2)} €
          {receipt.total_discount > 0 && (
            <span className={styles.discountTag}>
              -{receipt.total_discount.toFixed(2)} €
            </span>
          )}
          <span
            className={`${styles.receiptChevron} ${isOpen ? styles.receiptChevronOpen : ""}`}
          >
            <ChevronDown />
          </span>
        </div>
      </button>

      {isOpen && (
        <div className={styles.tableWrapper}>
          <table className={styles.itemTable}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Unit cost</th>
                <th>Storage</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((item) => (
                <ItemRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
