export interface CategoryStat {
  total: number;
  percentage_of_total: number;
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
}