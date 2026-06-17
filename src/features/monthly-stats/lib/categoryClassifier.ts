/**
 * Classifies a raw category key into a semantic type.
 *
 * Rule (per product decision):
 * - SALARY, RETURNS, and any INVESTMENT_* category are income
 * - BANK_TRANSFER is a transfer between the user's own accounts and is
 *   excluded from both income and expense totals, since the counterpart
 *   statement is not uploaded and including it would double count or
 *   misrepresent cash flow
 * - everything else is an expense
 *
 * This is the ONLY place category-type rules live. If the classification
 * logic ever changes, this is the single file to update.
 */

export type CategoryType = "income" | "expense" | "transfer";

const INCOME_CATEGORIES = new Set(["SALARY", "RETURNS", "OTHER_INCOME"]);
const TRANSFER_CATEGORIES = new Set(["BANK_TRANSFER"]);

export function classifyCategory(categoryKey: string): CategoryType {
  if (TRANSFER_CATEGORIES.has(categoryKey)) {
    return "transfer";
  }

  if (
    INCOME_CATEGORIES.has(categoryKey) ||
    categoryKey.startsWith("INVESTMENT")
  ) {
    return "income";
  }

  return "expense";
}

export function isIncomeCategory(categoryKey: string): boolean {
  return classifyCategory(categoryKey) === "income";
}

export function isExpenseCategory(categoryKey: string): boolean {
  return classifyCategory(categoryKey) === "expense";
}