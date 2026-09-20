import React from "react";
import { useManageStatements } from "../hooks/useManageStatements";
import { DateNavigator } from "./DateNavigator";
import { StatementAccordion } from "./StatementAccordion";
import { MonthlyStatsContainer } from "../../monthly-stats/components/MonthlyStatsContainer";
import { UploadPage } from "../../statement-upload/components/UploadPage";
import styles from "../styles/StatementManage.module.css";

export const StatementManagePage: React.FC = () => {
  const {
    month,
    year,
    setYear,
    statements,
    activeBank,
    setActiveBank,
    selectedStatement,
    loading,
    error,
    saveError,
    statsVersion,
    changeCategory,
    handlePrev,
    handleNext,
  } = useManageStatements();

  return (
    <div className={styles.viewWrapper}>
      <DateNavigator
        month={month}
        year={year}
        onPrev={handlePrev}
        onNext={handleNext}
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
          {statements.length > 0 ? (
            <>
              <div className={styles.tabsContainer}>
                {statements.map((s) => (
                  <button
                    key={s.bank}
                    className={`${styles.tab} ${activeBank === s.bank ? styles.activeTab : ""}`}
                    onClick={() => setActiveBank(s.bank)}
                  >
                    {s.bank}
                  </button>
                ))}
              </div>

              {selectedStatement && (
                <StatementAccordion statement={selectedStatement} onCategoryChange={changeCategory} />
              )}
            </>
          ) : (
            <div>
              <div
                className={styles.infoMessage}
                style={{ paddingBottom: "16px" }}
              >
                No statements found for{" "}
                <strong>
                  {month} {year}
                </strong>
                .
              </div>
              <UploadPage />
            </div>
          )}
        </>
      )}
    </div>
  );
};
