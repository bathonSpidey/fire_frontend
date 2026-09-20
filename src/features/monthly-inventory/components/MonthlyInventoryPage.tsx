import React, { useEffect, useRef, useState } from "react";
import { useMonthlyInventory } from "../hooks/useMonthlyInventory";
import { useReceiptUpload } from "../../receipt-upload/hooks/useReceiptUpload";
import { isActive } from "../../receipt-upload/types";
import { InventoryStats } from "./InventoryStats";
import { ReceiptCard } from "./ReceiptCard";
import styles from "../styles/MonthlyInventory.module.css";

const MONTHS = [
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

const ChevronLeft: React.FC = () => (
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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight: React.FC = () => (
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
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const UploadIcon: React.FC = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const MonthlyInventoryPage: React.FC = () => {
  const {
    month,
    year,
    receipts,
    loading,
    error,
    handlePrevMonth,
    handleNextMonth,
    updateItemStatus,
    updateItemCategory,
    saveError,
    reload,
  } = useMonthlyInventory();
  const { uploadFiles, uploading, owner, jobs } = useReceiptUpload();
  const activeCount = jobs.filter(isActive).length;
  const previousActive = useRef(0);

  // When background receipts finish, show them without a manual refresh.
  useEffect(() => {
    if (previousActive.current > 0 && activeCount === 0) reload();
    previousActive.current = activeCount;
  }, [activeCount, reload]);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const filteredReceipts = receipts
    .map((receipt) => ({
      ...receipt,
      items: receipt.items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((receipt) => receipt.items.length > 0);

  return (
    <div className={styles.container}>
      <div className={styles.navigator}>
        <button
          className={styles.navButton}
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft />
        </button>
        <h2 className={styles.navigatorTitle}>
          {MONTHS[month]} {year}
        </h2>
        <button
          className={styles.navButton}
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      {loading && (
        <div className={styles.infoMessage}>Loading inventory logs...</div>
      )}
      {error && <div className={styles.errorMessage}>{error}</div>}
      {saveError && <div className={styles.errorMessage}>{saveError}</div>}

      {!loading && !error && (
        <>
          <InventoryStats receipts={receipts} />

          <div className={styles.searchRow}>
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Search items or categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search inventory items"
            />
            <button
              className={styles.uploadBtn}
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" /> Uploading...
                </>
              ) : (
                <>
                  <UploadIcon /> Upload receipts
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className={styles.hiddenInput}
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
          </div>

          {activeCount > 0 && (
            <div className={styles.infoMessage}>
              Reading {activeCount} receipt(s) in the background (as {owner}). They appear here
              when done; progress is on the Upload page.
            </div>
          )}

          {filteredReceipts.length === 0 ? (
            <div className={styles.emptyState}>
              No matching inventory items found for {MONTHS[month]} {year}.
            </div>
          ) : (
            filteredReceipts.map((receipt) => (
              <ReceiptCard
                key={receipt.id}
                receipt={receipt}
                onItemStatusChange={updateItemStatus}
                onItemCategoryChange={updateItemCategory}
              />
            ))
          )}
        </>
      )}
    </div>
  );
};
