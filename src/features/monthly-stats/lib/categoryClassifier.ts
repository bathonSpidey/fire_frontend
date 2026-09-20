/**
 * Classifies a raw category key into a semantic type.
 *
 * Rule (per product decision):
 * - SALARY, RETURNS and OTHER_INCOME are income.
 * - BANK_TRANSFER and INVESTMENT* are NOT income and NOT an expense: money bought into
 *   investments (or moved between the user's own accounts) is still the user's wealth. It has
 *   its own "Invested" figure (total_invested), so listing it in the income or expense
 *   breakdown would double count it. It used to be classified as income, which made every
 *   investment purchase show up as income on top of the transfer that funded it.
 * - everything else is an expense.
 *
 * This is the ONLY place category-type rules live. If the classification
 * logic ever changes, this is the single file to update.
 */

export type CategoryType = "income" | "expense" | "transfer" | "investment";

const INCOME_CATEGORIES = new Set(["SALARY", "RETURNS", "OTHER_INCOME"]);
const TRANSFER_CATEGORIES = new Set(["BANK_TRANSFER", "INTERNAL_TRANSFER_IN", "INTERNAL_TRANSFER_OUT"]);

export function classifyCategory(categoryKey: string): CategoryType {
  if (TRANSFER_CATEGORIES.has(categoryKey)) {
    return "transfer";
  }

  if (categoryKey.startsWith("INVESTMENT")) {
    return "investment";
  }

  if (INCOME_CATEGORIES.has(categoryKey)) {
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
