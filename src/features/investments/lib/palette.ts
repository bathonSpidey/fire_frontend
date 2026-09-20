import { useEffect, useState } from "react";
import type { Broker } from "../types";
import { UNKNOWN } from "../types";

// Categorical slots in their fixed order, validated for both surfaces (adjacent pairs, colour-blind
// safe). Colour follows the thing, never its rank: a broker keeps its colour on every page.
const SLOTS = {
  light: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"],
  dark: ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300"],
};

export interface ChartColors {
  slots: string[];
  neutral: string; // "Unknown" / "Other": something that is not a series
  surface: string;
  grid: string;
  axis: string; // text tokens for ticks and labels
  ink: string;
  accent: string; // the single-series line (slot 1)
}

export const chartColors = (dark: boolean): ChartColors => ({
  slots: dark ? SLOTS.dark : SLOTS.light,
  neutral: dark ? "#6f6f6a" : "#a3a29c",
  surface: dark ? "#18181b" : "#ffffff",
  grid: dark ? "#2e2e33" : "#ececea",
  axis: dark ? "#a1a1aa" : "#71717a",
  ink: dark ? "#f4f4f5" : "#09090b",
  accent: dark ? SLOTS.dark[0] : SLOTS.light[0],
});

const BROKER_SLOT: Record<Broker, number> = { N26: 0, Commerzbank: 1, Sparkasse: 2 };

export const brokerColor = (colors: ChartColors, broker: string): string =>
  colors.slots[BROKER_SLOT[broker as Broker] ?? 5];

export const OTHER = "Other";

/**
 * Colours for the instruments of a chart: the biggest keep the first slots, the rest fold into
 * "Other" (never more hues than slots), and "Unknown" is the neutral. Order = biggest first, so a
 * name keeps its colour as long as the ranking of the ones above it does not change.
 */
export const instrumentColors = (colors: ChartColors, names: string[]): Record<string, string> => {
  const known = names.filter((n) => n !== UNKNOWN);
  const out: Record<string, string> = {};
  known.forEach((name, i) => {
    out[name] = i < colors.slots.length - 1 ? colors.slots[i] : colors.neutral;
  });
  out[UNKNOWN] = colors.neutral;
  out[OTHER] = colors.neutral;
  return out;
};

/** Whether the page is in dark mode now, following the toggle in the navigation bar. */
export const useDarkMode = (): boolean => {
  const read = () => document.documentElement.getAttribute("data-theme") === "dark";
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return dark;
};
