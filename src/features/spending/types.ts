export interface SpendingCategory {
  key: string;
  label: string;
  group: string;
  fixed: boolean;
  amount: number;
  receipt_amount: number;
  bank_amount: number;
  share_pct: number;
  previous_amount: number;
}

export interface UnmatchedReceipt {
  receipt_id: number;
  store: string;
  date: string;
  total: number;
  owner: string | null;
}

export interface MissingReceipt {
  transaction_id: number;
  date: string;
  amount: number;
  counterparty: string;
}

export interface MonthSpending {
  year: number;
  month: number;
  total: number;
  receipt_total: number;
  bank_only_total: number;
  previous_total: number;
  categories: SpendingCategory[];
  groups: { group: string; amount: number; share_pct: number }[];
  owners: { owner: string; amount: number }[];
  stores: { store: string; amount: number }[];
  receipts: { count: number; average_basket: number; discounts_saved: number };
  uncategorized: { entries: number; amount: number };
  discrepancies: {
    has_statement: boolean;
    awaiting_statement: boolean;
    unmatched_receipts: UnmatchedReceipt[];
    missing_receipts: MissingReceipt[];
  };
}

export interface TrendMonth {
  year: number;
  month: number;
  label: string;
  partial: boolean; // the month is not over yet
  total: number;
  fixed: number;
  flexible: number;
  by_category: Record<string, number>;
  by_group: Record<string, number>;
}

export interface TrendCategory {
  key: string;
  label: string;
  group: string;
  fixed: boolean;
  total: number;
  average: number; // over finished months that have data
}

export interface Mover {
  key: string;
  label: string;
  now: number;
  average: number;
  change: number;
  change_pct: number | null;
}

export interface Trends {
  months: TrendMonth[];
  categories: TrendCategory[];
  groups: string[];
  movers: { month: string | null; baseline_months: number; up: Mover[]; down: Mover[] };
  average_total: number;
  average_fixed: number;
}

export interface Pace {
  days: number;
  current: number[]; // running total per day
  previous: number[];
  current_total: number;
  previous_same_day: number;
  previous_total: number;
  in_progress: boolean;
  unfair_comparison: boolean;
}

export type Frequency = "monthly" | "quarterly" | "yearly";

export interface Subscription {
  key: string;
  name: string;
  category_key: string | null;
  category: string;
  section: "subscription" | "bill";
  amount: number;
  frequency: Frequency;
  monthly_cost: number;
  yearly_cost: number;
  payments: number;
  first_date: string;
  last_date: string;
  next_expected: string | null;
  status: "active" | "ended";
  evidence: "pattern" | "category" | "you";
  confidence: "confirmed" | "likely" | "assumed";
  price_change: { from: number; to: number } | null;
  history: { date: string; amount: number }[];
}

export interface Subscriptions {
  items: Subscription[];
  hidden: { key: string; name: string }[];
  summary: {
    monthly_total: number;
    yearly_total: number;
    active: number;
    assumed_monthly: number;
    subscriptions_monthly: number;
    bills_monthly: number;
    price_rises: number;
  };
  statements_reach: string | null;
}
