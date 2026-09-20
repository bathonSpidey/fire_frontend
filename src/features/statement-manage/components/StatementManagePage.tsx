import React from "react";
import { useManageStatements } from "../hooks/useManageStatements";
import { DateNavigator } from "./DateNavigator";
import { ReceiptAccordion } from "./ReceiptAccordion";
import { StatementAccordion } from "./StatementAccordion";
import { MonthlyStatsContainer } from "../../monthly-stats/components/MonthlyStatsContainer";
import { UploadPage } from "../../statement-upload/components/UploadPage";
import styles from "../styles/StatementManage.module.css";

const RECEIPTS_TAB = "__receipts__";

export const StatementManagePage: React.FC = () => {
  const {
    month,
    year,
    setYear,
    canGoNext,
    statements,
    receipts,
    activeBank,
    setActiveBank,
    selectedStatement,
    loading,
    error,
    saveError,
    statsVersion,
    changeCategory,
    changeItemCategory,
    handlePrev,
    handleNext,
  } = useManageStatements();

  // A month can consist of receipts only (the bank statement comes weeks later).
  const hasReceipts = receipts.length > 0;
  const showReceipts = activeBank === RECEIPTS_TAB || (activeBank === null && hasReceipts);

  return (
    <div className={styles.viewWrapper}>
      <DateNavigator
        month={month}
        year={year}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoNext={canGoNext}
        onYearChange={setYear}
      />

      {/* Fully decoupled stats engine layer */}
      <MonthlyStatsContainer month={month} year={year} refreshKey={statsVersion} />

      {loading && (
        <div className={styles.infoMessage}>Loading statements...</div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}
      {saveError && <div className={styles.errorMessage}>{saveError}</div>}

      {!loading && !error && (
        <>
          {statements.length > 0 || hasReceipts ? (
            <>
              <div className={styles.tabsContainer}>
                {statements.map((s) => (
                  <button
                    key={s.bank}
                    className={`${styles.tab} ${!showReceipts && activeBank === s.bank ? styles.activeTab : ""}`}
                    onClick={() => setActiveBank(s.bank)}
                  >
                    {s.bank}
                  </button>
                ))}
                {hasReceipts && (
                  <button
                    className={`${styles.tab} ${showReceipts ? styles.activeTab : ""}`}
                    onClick={() => setActiveBank(RECEIPTS_TAB)}
                  >
                    Receipts ({receipts.length})
                  </button>
                )}
              </div>

              {showReceipts
                ? receipts.map((receipt) => (
                    <ReceiptAccordion
                      key={receipt.id}
                      receipt={receipt}
                      onItemCategoryChange={changeItemCategory}
                    />
                  ))
                : selectedStatement && (
                    <StatementAccordion statement={selectedStatement} onCategoryChange={changeCategory} />
                  )}
            </>
          ) : (
            <div>
              <div
                className={styles.infoMessage}
                style={{ paddingBottom: "16px" }}
              >
                Nothing recorded for{" "}
                <strong>
                  {month} {year}
                </strong>{" "}
                yet.
              </div>
              <UploadPage />
            </div>
          )}
        </>
      )}
    </div>
  );
};
