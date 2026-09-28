import React, { useState } from "react";
import { useManageStatements } from "../hooks/useManageStatements";
import { DateNavigator } from "./DateNavigator";
import { ReceiptAccordion } from "./ReceiptAccordion";
import { StatementAccordion } from "./StatementAccordion";
import { MonthlyStatsContainer } from "../../monthly-stats/components/MonthlyStatsContainer";
import { UploadPage } from "../../statement-upload/components/UploadPage";
import type { BankStatementResponse } from "../../statement-upload/types";
import styles from "../styles/StatementManage.module.css";

const RECEIPTS_TAB = -1; // never a real statement id (those start at 1)

// A tab reads just the bank name until that stops being enough to tell statements apart: first the
// owner (two people can each have an account at the same bank), then the account itself (one person
// can have more than one account at the same bank, e.g. a checking and a savings account).
const tabLabel = (statement: BankStatementResponse, all: BankStatementResponse[]): string => {
  const sameBank = all.filter((s) => s.bank === statement.bank);
  if (sameBank.length <= 1) return statement.bank;
  const extras: string[] = [];
  if (statement.owner) extras.push(statement.owner);
  const sameOwnerToo = sameBank.filter((s) => s.owner === statement.owner).length > 1;
  if (sameOwnerToo && statement.account_number) extras.push(`...${statement.account_number.slice(-4)}`);
  return extras.length > 0 ? `${statement.bank} (${extras.join(", ")})` : statement.bank;
};

export const StatementManagePage: React.FC = () => {
  const {
    month,
    year,
    setYear,
    canGoNext,
    statements,
    receipts,
    activeId,
    setActiveId,
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
  const showReceipts = activeId === RECEIPTS_TAB || (activeId === null && hasReceipts);

  // The upload panel: a manual toggle, always available on top so no tab switch is needed, plus it
  // opens on its own whenever the selected month has nothing recorded yet.
  const [manualUpload, setManualUpload] = useState(false);
  const isEmptyMonth = !loading && !error && statements.length === 0 && !hasReceipts;
  const showUpload = manualUpload || isEmptyMonth;

  return (
    <div className={styles.viewWrapper}>
      <DateNavigator
        month={month}
        year={year}
        onPrev={handlePrev}
        onNext={handleNext}
        canGoNext={canGoNext}
        onYearChange={setYear}
        uploadOpen={showUpload}
        onToggleUpload={() => setManualUpload((v) => !v)}
      />

      {showUpload && <UploadPage />}

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
                    key={s.id}
                    className={`${styles.tab} ${!showReceipts && activeId === s.id ? styles.activeTab : ""}`}
                    onClick={() => setActiveId(s.id)}
                    title={s.status === "needs_review" ? (s.review_note ?? "Please check this statement") : undefined}
                  >
                    {tabLabel(s, statements)}
                    {s.status === "needs_review" && <span className={styles.tabWarningDot} aria-label="Please check" />}
                  </button>
                ))}
                {hasReceipts && (
                  <button
                    className={`${styles.tab} ${showReceipts ? styles.activeTab : ""}`}
                    onClick={() => setActiveId(RECEIPTS_TAB)}
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
          )}
        </>
      )}
    </div>
  );
};
