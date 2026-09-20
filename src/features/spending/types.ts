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
