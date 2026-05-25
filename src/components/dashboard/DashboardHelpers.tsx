import type { Transaction } from "../../types/api";

export function getMonthKey(date: string) {
  return date.slice(0, 7);
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

export function last6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return months;
}

export function computeMonthly(transactions: Transaction[], monthKey: string) {
  const txs = transactions.filter(
    (t) =>
      !t.is_receipt_item &&
      !t.is_investment_item &&
      t.transaction_type !== "transfer" &&
      t.date.startsWith(monthKey),
  );
  let income = 0,
    expenses = 0;
  const byCategory: Record<string, number> = {};
  for (const tx of txs) {
    const amt = parseFloat(tx.amount);
    if (tx.transaction_type === "credit") income += amt;
    else {
      expenses += amt;
      byCategory[tx.category] = (byCategory[tx.category] ?? 0) + amt;
    }
  }
  return { income, expenses, savings: income - expenses, byCategory };
}

export function savingsRate(income: number, savings: number) {
  if (income === 0) return 0;
  return Math.max(0, Math.min(100, (savings / income) * 100));
}

export function fireYears(
  monthlySavings: number,
  monthlyExpenses: number,
): number | null {
  if (monthlySavings <= 0 || monthlyExpenses <= 0) return null;
  return Math.round((monthlyExpenses * 12 * 25) / (monthlySavings * 12));
}

export const CATEGORY_COLORS: Record<string, string> = {
  groceries: "#f59e0b",
  dining: "#f97316",
  transport: "#3b82f6",
  housing: "#8b5cf6",
  utilities: "#06b6d4",
  healthcare: "#10b981",
  entertainment: "#ec4899",
  shopping: "#f43f5e",
  investment: "#14b8a6",
  other: "#475569",
};
