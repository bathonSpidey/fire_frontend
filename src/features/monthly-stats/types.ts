export interface CategoryStat {
  total: number;
  percentage_of_total: number;
  // Set by the backend from the household's category list
  flow?: "income" | "expense" | "investment" | null;
  label?: string | null;
  group?: string | null;
  fixed?: boolean;
}

// What a month's numbers are built from
export interface StatsSources {
  statements: string[]; // banks whose statement is uploaded for the month
  receipts: number; // receipts dated in the month
  receipt_total?: number; // spending that comes from receipt items
  bank_only_total?: number; // spending paid without a receipt (bank and PayPal)
}

export interface MonthlyStatsResponse {
  month: string;
  year: number;
  gross_income: number;
  lifestyle_expenses: number;
  net_savings: number;
  savings_rate_pct: number;
  total_invested: number;
  fixed_vs_variable_ratio: string;
  categories: Record<string, CategoryStat>;
  sources?: StatsSources | null;
}

export interface MonthlyStatsWithTrend {
  current: MonthlyStatsResponse;
  previous: MonthlyStatsResponse | null;
}

// What the household has right now (not tied to the selected month).
export interface NetWorthAccount {
  bank: string;
  balance: number | null; // null: no statement uploaded for this account yet
  as_of: string | null; // the date this balance is from
  stale: boolean | null; // null when balance is null
}

export interface NetWorthResponse {
  accounts: NetWorthAccount[];
  cash_total: number;
  invested: number;
  invested_note: string;
  net_worth: number;
  oldest_balance: string | null;
  any_stale: boolean;
}

// The household's own definition of financial independence.
export interface FireAdjustment {
  id: number;
  label: string;
  amount: number; // can be negative
  note: string | null;
}

export interface FireSummary {
  settings: { target_monthly_spend: number; withdrawal_rate: number } | null; // null: not set yet
  target_annual_spend: number | null;
  fire_number: number | null;
  net_worth: NetWorthResponse;
  adjustments: FireAdjustment[];
  adjustments_total: number;
  combined_net_worth: number;
  progress_pct: number | null;
  pace: { monthly_average: number | null; months_used: number; note: string };
  years_to_fire: number | null;
}
