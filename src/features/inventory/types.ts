export type StockGroup = "fridge" | "freezer" | "pantry" | "home";
export type Urgency = "expired" | "soon" | "week" | "ok" | "none";

export interface StockItem {
  id: number;
  name: string;
  brand: string | null;
  quantity: number;
  quantity_left: number;
  value_left: number;
  store: string;
  purchase_date: string;
  owner: string | null;
  category: string;
  spend_category: string | null;
  group: StockGroup;
  storage_condition: string;
  location: string | null;
  date_expiry: string | null; // best-before as printed / estimated
  effective_expiry: string | null; // the date that counts (sooner once opened)
  days_left: number | null;
  urgency: Urgency;
  stale: boolean; // expired long ago and never tracked
  opened_on: string | null;
  rating: number | null;
  would_rebuy: boolean | null;
  status: string;
  finished?: boolean; // set by actions: the last of it is gone
}

export interface StockSummary {
  items: number;
  value: number;
  groups: Record<StockGroup, number>;
  opened: number;
  use_soon: number;
  value_at_risk: number;
  stale: number;
}

export interface Insights {
  days: number;
  score: number | null;
  waste_rate_pct: number | null;
  wasted_value: number;
  wasted_items: number;
  used_value: number;
  days_since_last_waste: number | null;
  by_reason: Record<string, number>;
  by_group: Record<string, number>;
  top_wasted: { name: string; times: number; value: number }[];
  repeat_waste: string[];
  rescued: { items: number; value: number };
  duplicates: { name: string; count: number; locations: (string | null)[]; total_left: number }[];
  liked: { name: string; rating: number }[];
  avoid: { name: string; rating: number | null }[];
  summary: StockSummary;
}

export const REASONS: { value: string; label: string }[] = [
  { value: "expired", label: "Expired" },
  { value: "spoiled", label: "Went bad" },
  { value: "disliked", label: "Did not like it" },
  { value: "too_much", label: "Too much" },
  { value: "other", label: "Other" },
  { value: "gave_away", label: "Gave it away (not waste)" },
];

export const GROUP_LABEL: Record<StockGroup, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  pantry: "Pantry",
  home: "Home & care",
};

// Places to suggest before the household has named any of its own.
export const DEFAULT_PLACES: Record<StockGroup, string[]> = {
  fridge: ["Fridge door", "Fridge top shelf", "Fridge middle shelf", "Vegetable drawer"],
  freezer: ["Freezer drawer 1", "Freezer drawer 2", "Freezer drawer 3"],
  pantry: ["Pantry shelf", "Kitchen cabinet", "Cellar"],
  home: ["Bathroom cabinet", "Medicine cabinet", "Storage room", "Office"],
};
