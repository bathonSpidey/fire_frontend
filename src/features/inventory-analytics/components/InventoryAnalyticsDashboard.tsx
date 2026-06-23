import React from "react";
import { useInventoryAnalytics } from "../hooks/useInventoryAnalytics";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { KpiRow } from "./KpiRow";
import { DeficitPanel } from "./DeficitPanel";
import { InflationPanel } from "./InflationPanel";
import { LeakageCategoryChart } from "./LeakageCategoryChart";
import { DeficitUrgencyChart } from "./DeficitUrgencyChart";
import { RollingStaplesPanel } from "./RollingStaplesPanel";
import { EssentialsTable } from "./EssentialsTable";
import styles from "../styles/InventoryAnalytics.module.css";

export const InventoryAnalyticsDashboard: React.FC = () => {
  const {
    data,
    loading,
    error,
    rollingDays,
    leakageDays,
    setRollingDays,
    setLeakageDays,
  } = useInventoryAnalytics();

  if (loading) {
    return (
      <div className={styles.centeredMsg}>
        Calculating inventory optimization matrices...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`${styles.centeredMsg} ${styles.centeredMsgError}`}>
        {error ?? "No data available"}
      </div>
    );
  }

  const hasLeakageBreakdown =
    Object.keys(data.financial_leakage.loss_by_category_breakdown).length > 0;

  return (
    <div className={styles.dashboardContainer}>
      <AnalyticsHeader
        rollingDays={rollingDays}
        leakageDays={leakageDays}
        onRollingDaysChange={setRollingDays}
        onLeakageDaysChange={setLeakageDays}
      />

      <KpiRow data={data} />

      {/* Operational hub: deficit list + inflation list */}
      <div className={styles.splitLayout}>
        <DeficitPanel deficits={data.predicted_pantry_deficits} />
        <InflationPanel alerts={data.price_inflation_alerts} />
      </div>

      {/* Charts row: leakage bar + urgency donut */}
      {hasLeakageBreakdown && (
        <div className={styles.splitLayout}>
          <LeakageCategoryChart
            breakdown={data.financial_leakage.loss_by_category_breakdown}
            totalWasted={data.financial_leakage.total_capital_wasted}
          />
          <DeficitUrgencyChart deficits={data.predicted_pantry_deficits} />
        </div>
      )}

      {/* Rolling staples cadence panel */}
      <RollingStaplesPanel staples={data.rolling_staples} />

      {/* Essentials velocity table */}
      <EssentialsTable essentials={data.regularly_purchased_essentials} />
    </div>
  );
};
