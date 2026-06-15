export interface BankTransaction {
  date: string;
  description: string;
  amount: number;
}

export interface BankStatementResponse {
  month: string;
  year: number;
  bank: string;
  starting_balance: number;
  closing_balance: number;
  transactions: BankTransaction[];
}