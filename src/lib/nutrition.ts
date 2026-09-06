import type { Ingredient, Nutrition, Recipe, RecipeIngredient } from './types';
import { normaliseAmount } from './units';

export interface NutritionTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * How many "basis" units of an ingredient this recipe line represents — e.g. a
 * 600g line against per-100g figures gives 6. Returns null when the line's unit
 * cannot be reconciled with the unit the nutrition was recorded in (a
 * tablespoon of oil against per-100ml figures), because guessing a density
 * would invent data.
 */
function basisMultiplier(line: RecipeIngredient, nutrition: Nutrition): number | null {
  const amount = normaliseAmount(line.qty, line.unit);
  const basis = normaliseAmount(nutrition.basis, nutrition.unit);

  if (amount.unit !== basis.unit || basis.qty === 0) return null;
  return amount.qty / basis.qty;
}

/**
 * Nutrition for one portion of a recipe, summed from its ingredients.
 *
 * Returns null unless *every* ingredient has usable figures — a partial total
 * would be misleading, and today no ingredient has nutrition recorded at all,
 * so this returns null for every recipe. `NutritionPanel.astro` renders nothing
 * on null, so the section simply appears once the data is filled in.
 */
export function perPortion(
  recipe: Recipe,
  ingredientsById: Record<string, Ingredient>,
): NutritionTotals | null {
  if (recipe.ingredients.length === 0 || recipe.baseServings <= 0) return null;

  const totals: NutritionTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  for (const line of recipe.ingredients) {
    const nutrition = ingredientsById[line.ingredientId]?.nutrition;
    if (!nutrition) return null;

    const multiplier = basisMultiplier(line, nutrition);
    if (multiplier === null) return null;

    totals.kcal += nutrition.kcal * multiplier;
    totals.protein += nutrition.protein * multiplier;
    totals.carbs += nutrition.carbs * multiplier;
    totals.fat += nutrition.fat * multiplier;
  }

  const round1 = (n: number) => Math.round((n / recipe.baseServings) * 10) / 10;

  return {
    kcal: Math.round(totals.kcal / recipe.baseServings),
    protein: round1(totals.protein),
    carbs: round1(totals.carbs),
    fat: round1(totals.fat),
  };
}
