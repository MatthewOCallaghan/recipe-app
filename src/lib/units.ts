/**
 * Quantity formatting and unit handling, ported from the design prototype's
 * `formatIngredient` so the rendered strings match it exactly.
 */

/** Units that render flush against the number: "600g", not "600 g". */
const TIGHT_UNITS = new Set(['g', 'ml', 'kg', 'l']);

/** Units that collapse into a smaller base unit purely for adding things up. */
const CONVERSIONS: Record<string, { unit: string; factor: number }> = {
  kg: { unit: 'g', factor: 1000 },
  l: { unit: 'ml', factor: 1000 },
};

/** Round to one decimal place; whole numbers keep no trailing ".0". */
export function formatQty(n: number): string {
  return String(Math.round(n * 10) / 10);
}

/**
 * "600g" / "2 tbsp" / "3" (bare number for counted ingredients).
 */
export function formatAmount(qty: number, unit: string): string {
  const q = formatQty(qty);
  if (!unit) return q;
  if (TIGHT_UNITS.has(unit)) return q + unit;
  return `${q} ${unit}`;
}

/**
 * Convert an amount into its base unit so that 1kg and 500g can be summed.
 * Units with no conversion are returned untouched, which keeps incompatible
 * measures (g vs tbsp) apart rather than silently adding them together.
 */
export function normaliseAmount(
  qty: number,
  unit: string,
): { qty: number; unit: string } {
  const conversion = CONVERSIONS[unit];
  return conversion
    ? { qty: qty * conversion.factor, unit: conversion.unit }
    : { qty, unit };
}
