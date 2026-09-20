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