export interface BankTransaction {
  id?: number | null; // lets the page change this booking's category
  category?: string | null;
  date: string;
  description: string;
  amount: number;
  // Present for statements read by Claude
  kind?: string | null;
  transfer_group?: number | null;
  mirror_of?: number | null; // PayPal rows: the bank booking this payment is the detail of
}

export interface BankStatementResponse {
  month: string;
  year: number;
  bank: string;
  starting_balance: number;
  closing_balance: number;
  transactions: BankTransaction[];
}
