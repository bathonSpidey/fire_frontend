/**
 * Single source of truth for urgency level display config.
 * All urgency-related colors, labels, and CSS identifiers live here.
 * Components consume this map — never branch on urgency strings directly.
 */

import type { PredictedDeficit } from "../types";

type UrgencyLevel = PredictedDeficit["urgency"];

export interface UrgencyConfig {
  label: string;
  cssModifier: string; // maps to styles.urgency{X} in CSS module
  order: number;       // for sorting — lower = more urgent
}

export const URGENCY_CONFIG: Record<UrgencyLevel, UrgencyConfig> = {
  CRITICAL: { label: "Critical", cssModifier: "CRITICAL", order: 0 },
  HIGH:     { label: "High",     cssModifier: "HIGH",     order: 1 },
  MEDIUM:   { label: "Medium",   cssModifier: "MEDIUM",   order: 2 },
  LOW:      { label: "Low",      cssModifier: "LOW",      order: 3 },
};

export const URGENCY_CHART_COLORS: Record<UrgencyLevel, string> = {
  CRITICAL: "var(--danger)",
  HIGH:     "var(--warning-text, #e6a23c)",
  MEDIUM:   "var(--ai-purple)",
  LOW:      "var(--primary)",
};

export function sortByUrgency<T extends { urgency: UrgencyLevel }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => URGENCY_CONFIG[a.urgency].order - URGENCY_CONFIG[b.urgency].order,
  );
}