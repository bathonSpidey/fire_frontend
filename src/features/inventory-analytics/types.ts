export interface RollingStaple {
  name: string;
  purchase_frequency_days: number;
  distribution_weeks: number;
  total_units_purchased: number;
  average_unit_cost_basis: number;
}

export interface PredictedDeficit {
  name: string;
  deficit_trigger: "MANUAL_STATUS_EXHAUSTION" | "TEMPORAL_SHELF_LIFE_EXPIRED";
  last_action_state: "Consumed" | "Spoiled" | "Discarded" | "Available";
  last_purchased_date: string;
  expiry_date_passed?: string;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

export interface RegularEssential {
  name: string;
  category: string;
  storage_condition: string;
  brand: string;
  total_purchases_tracked: number;
  average_restock_interval_days: number;
  consumption_pacing_profile: string;
  historical_span_days: number;
}

export interface FinancialLeakage {
  rolling_evaluation_days: number;
  total_capital_wasted: number;
  loss_by_category_breakdown: Record<string, number>;
}

export interface InflationAlert {
  item_name: string;
  historical_base_price: number;
  latest_market_price: number;
  percentage_inflation_drift: number;
  first_tracked_date: string;
  latest_tracked_date: string;
}

export interface InventoryAnalyticsPayload {
  rolling_staples: RollingStaple[];
  predicted_pantry_deficits: PredictedDeficit[];
  regularly_purchased_essentials: RegularEssential[];
  financial_leakage: FinancialLeakage;
  price_inflation_alerts: InflationAlert[];
}