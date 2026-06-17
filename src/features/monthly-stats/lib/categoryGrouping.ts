import type { CategoryStat } from "../types";
import { classifyCategory } from "./categoryClassifier";

export interface NamedCategoryStat extends CategoryStat {
  name: string;
}

interface GroupedCategories {
  income: NamedCategoryStat[];
  expense: NamedCategoryStat[];
}

/**
 * Splits categories into income/expense groups, dropping transfers, and
 * sorts each group by total descending. Transfers are excluded entirely
 * per the classification rule (see categoryClassifier.ts).
 */
export function groupCategoriesByType(
  categories: Record<string, CategoryStat>,
): GroupedCategories {
  const income: NamedCategoryStat[] = [];
  const expense: NamedCategoryStat[] = [];

  for (const [name, stat] of Object.entries(categories)) {
    const type = classifyCategory(name);
    if (type === "transfer") continue;

    const entry: NamedCategoryStat = { name, ...stat };
    if (type === "income") {
      income.push(entry);
    } else {
      expense.push(entry);
    }
  }

  income.sort((a, b) => b.total - a.total);
  expense.sort((a, b) => b.total - a.total);

  return { income, expense };
}

export function formatCategoryLabel(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}