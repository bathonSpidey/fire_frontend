import React from 'react';
import { useManageStatements } from '../hooks/useManageStatements';
import { DateNavigator } from './DateNavigator';
import { StatementAccordion } from './StatementAccordion';
import styles from '../styles/StatementManage.module.css';

export const StatementManagePage: React.FC = () => {
  const {
    month, year, setYear,
    statements, activeBank, setActiveBank,
    selectedStatement, loading, error,
    handlePrev, handleNext
  } = useManageStatements();

  return (
    <div className={styles.viewWrapper}>
      <DateNavigator 
        month={month} year={year} 
        onPrev={handlePrev} onNext={handleNext} 
        onYearChange={setYear} 
      />

      {loading && <div className={styles.infoMessage}>Loading statements...</div>}
      {error && <div className={styles.infoMessage} style={{ color: 'var(--danger)' }}>{error}</div>}

      {!loading && statements.length > 0 && (
        <>
          <div className={styles.tabsContainer}>
            {statements.map((s) => (
              <button
                key={s.bank}
                className={`${styles.tab} ${activeBank === s.bank ? styles.activeTab : ''}`}
                onClick={() => setActiveBank(s.bank)}
              >
                {s.bank}
              </button>
            ))}
          </div>

          {selectedStatement && <StatementAccordion statement={selectedStatement} />}
        </>
      )}

      {!loading && !error && statements.length === 0 && (
        <div className={styles.infoMessage}>No statements registered for {month} {year}.</div>
      )}
    </div>
  );
};