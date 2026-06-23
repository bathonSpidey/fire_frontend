import React from "react";
import { useInventoryAnalytics } from "../hooks/useInventoryAnalytics";
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

  if (loading)
    return (
      <div className={styles.centeredMsg}>
        Calculating inventory optimization matrices...
      </div>
    );
  if (error || !data)
    return (
      <div className={`${styles.centeredMsg} ${styles.error}`}>
        {error || "No data available"}
      </div>
    );

  const primaryInflationAlerts = data.price_inflation_alerts.filter(
    (a) => a.percentage_inflation_drift > 20,
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Header View controls */}
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Inventory Analytics</h1>
          <p className={styles.dashSubtitle}>
            Pacing profiles and defensive capital tracking
          </p>
        </div>

        {/* Dynamic UI selectors passing target values straight into the hook updates */}
        <div className={styles.filterGroup}>
          <label>
            Rolling Span:
            <select
              value={rollingDays}
              onChange={(e) => setRollingDays(Number(e.target.value))}
            >
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={180}>180 Days</option>
            </select>
          </label>
          <label>
            Leakage Window:
            <select
              value={leakageDays}
              onChange={(e) => setLeakageDays(Number(e.target.value))}
            >
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
              <option value={60}>60 Days</option>
            </select>
          </label>
        </div>
      </div>

      {/* Row 1: KPI Panels */}
      <div className={styles.kpiGrid}>
        <div
          className={`${styles.kpiCard} ${data.financial_leakage.total_capital_wasted > 0 ? styles.kpiLeakage : ""}`}
        >
          <span className={styles.kpiLabel}>
            Capital Wasted ({data.financial_leakage.rolling_evaluation_days}d)
          </span>
          <span className={styles.kpiValue}>
            {data.financial_leakage.total_capital_wasted.toFixed(2)} €
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Pantry Deficits</span>
          <span className={styles.kpiValue}>
            {
              data.predicted_pantry_deficits.filter(
                (d) => d.urgency === "CRITICAL",
              ).length
            }{" "}
            Critical
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>
            High Inflation Items (&gt;20%)
          </span>
          <span
            className={`${styles.kpiValue} ${primaryInflationAlerts.length > 0 ? styles.kpiAlertText : ""}`}
          >
            {primaryInflationAlerts.length} Products
          </span>
        </div>
      </div>

      {/* Row 2: Two-Column Operational Hub */}
      <div className={styles.mainSplitLayout}>
        {/* Left Column: Urgency Action Panels */}
        <div className={styles.splitColumn}>
          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>
              🚨 Restock Shortfalls (Auto Shopping List)
            </h2>
            <div className={styles.scrollList}>
              {data.predicted_pantry_deficits.map((deficit, index) => (
                <div
                  key={index}
                  className={`${styles.listItem} ${styles[`urgency${deficit.urgency}`]}`}
                >
                  <div>
                    <div className={styles.itemNameBold}>{deficit.name}</div>
                    <div className={styles.itemMetaSub}>
                      Trigger: {deficit.deficit_trigger.replace(/_/g, " ")} |
                      Last State: {deficit.last_action_state}
                    </div>
                  </div>
                  <span className={styles.urgencyBadge}>{deficit.urgency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Safeguards */}
        <div className={styles.splitColumn}>
          <div className={styles.panelCard}>
            <h2 className={styles.panelTitle}>📈 Price & Inflation Surges</h2>
            <div className={styles.scrollList}>
              {data.price_inflation_alerts.map((alert, index) => (
                <div key={index} className={styles.listItem}>
                  <div>
                    <div className={styles.itemNameBold}>{alert.item_name}</div>
                    <div className={styles.itemMetaSub}>
                      Base: {alert.historical_base_price.toFixed(2)}€ → Latest:{" "}
                      {alert.latest_market_price.toFixed(2)}€
                    </div>
                  </div>
                  <span
                    className={`${styles.inflationBadge} ${alert.percentage_inflation_drift > 40 ? styles.severeInflation : ""}`}
                  >
                    +{alert.percentage_inflation_drift.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Full-width Long-Term Velocity Registry */}
      <div className={styles.panelCard} style={{ marginTop: "24px" }}>
        <h2 className={styles.panelTitle}>
          🔄 Regularly Managed Essentials & Pacing Profiles
        </h2>
        <div className={styles.tableResponsive}>
          <table className={styles.analyticsTable}>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Storage</th>
                <th>Avg Restock Cycle</th>
                <th>Velocity Profile</th>
                <th>Observed Span</th>
              </tr>
            </thead>
            <tbody>
              {data.regularly_purchased_essentials.map((essential, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{essential.name}</td>
                  <td>
                    {essential.brand !== "Generic" ? essential.brand : "—"}
                  </td>
                  <td>{essential.category}</td>
                  <td>{essential.storage_condition}</td>
                  <td>
                    {essential.average_restock_interval_days.toFixed(1)} days
                  </td>
                  <td>
                    <span className={styles.pacingPill}>
                      {essential.consumption_pacing_profile}
                    </span>
                  </td>
                  <td>{essential.historical_span_days} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
