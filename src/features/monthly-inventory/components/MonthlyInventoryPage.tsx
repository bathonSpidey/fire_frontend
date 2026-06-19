import React, { useState } from "react";
import { useMonthlyInventory } from "../hooks/useMonthlyInventory";
import { InventoryStats } from "./InventoryStats";
import styles from "../styles/MonthlyInventory.module.css";

const MONTHS_MAP = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MonthlyInventoryPage: React.FC = () => {
  const {
    month,
    year,
    receipts,
    loading,
    error,
    handlePrevMonth,
    handleNextMonth,
  } = useMonthlyInventory();
  const [search, setSearch] = useState("");

  // Client-side filtering logic matching input words against item names or categories
  const filteredReceipts = receipts
    .map((receipt) => {
      const matchingItems = receipt.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase()),
      );
      return { ...receipt, items: matchingItems };
    })
    .filter((receipt) => receipt.items.length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.navigator}>
        <button className={styles.navButton} onClick={handlePrevMonth}>
          ← Previous
        </button>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {MONTHS_MAP[month]} {year}
        </h2>
        <button className={styles.navButton} onClick={handleNextMonth}>
          Next →
        </button>
      </div>

      {loading && (
        <div style={{ color: "var(--text-secondary)" }}>
          Loading smartory inventory logs...
        </div>
      )}
      {error && <div style={{ color: "var(--danger-text)" }}>{error}</div>}

      {!loading && !error && (
        <>
          <InventoryStats receipts={receipts} />

          <input
            type="text"
            className={styles.searchBar}
            placeholder="🔍 Search items or categories inside this month..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredReceipts.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "var(--text-secondary)",
              }}
            >
              No matching inventory items found for this timeline slice.
            </div>
          ) : (
            filteredReceipts.map((receipt) => (
              <div key={receipt.id} className={styles.receiptCard}>
                <div className={styles.receiptHeader}>
                  <div>
                    <span className={styles.storeTitle}>
                      {receipt.store_name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginLeft: "12px",
                      }}
                    >
                      {receipt.purchase_date}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {receipt.total_amount.toFixed(2)}€
                  </div>
                </div>

                <table className={styles.itemTable}>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th>Qty</th>
                      <th>Unit Cost</th>
                      <th>Storage</th>
                      <th>Expiry</th>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};
