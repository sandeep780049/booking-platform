/**
 * Shared currency formatting utilities.
 * All monetary values in this app are denominated in EUR.
 */

const euroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

/**
 * Format a numeric value as a Euro currency string.
 * Returns "€0,00" for null / undefined / NaN / Infinity.
 */
export const formatCurrency = (value = 0) => {
  const num = Number(value);
  return euroFormatter.format(Number.isFinite(num) ? num : 0);
};

/**
 * Compact formatter for chart tick labels, e.g. "€1.200".
 * Keeps the output short to avoid cluttered axes.
 */
export const formatCurrencyCompact = (value = 0) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "€0";
  if (Math.abs(num) >= 1_000_000) return `€${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `€${(num / 1_000).toFixed(1)}k`;
  return `€${num.toFixed(0)}`;
};
