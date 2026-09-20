export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
  // Present for statements read by Claude
  kind?: string | null;
  transfer_group?: number | null;
}

export interface BankStatementResponse {
  month: string;
  year: number;
  bank: string;
  starting_balance: number;
  closing_balance: number;
  transactions: BankTransaction[];
}
