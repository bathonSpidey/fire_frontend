export const euro = (value: number): string =>
  value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });

export const euroShort = (value: number): string => `${Math.round(value).toLocaleString("de-DE")} €`;

// Dates in English to match the screen; only money uses the German number format.
export const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const monthYear = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
