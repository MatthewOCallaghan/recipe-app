import type { Ingredient, Recipe } from './types';
import { formatAmount } from './units';

/** Index a list of records by their slug id, for cheap lookups in components. */
export function indexById<T extends { id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

/** How much to multiply a recipe's quantities by for the chosen portion count. */
export function scaleFactor(portions: number, baseServings: number): number {
  if (baseServings <= 0) return 1;
  return portions / baseServings;
}

export interface ScaledLine {
  ingredientId: string;
  /** Ingredient name with this recipe's prep note, e.g. "Onion, diced". */
  label: string;
  qty: number;
  unit: string;
  /** Formatted quantity, e.g. "900g". */
  display: string;
}

/**
 * A recipe's ingredient list scaled to `portions`, joined to the shared
 * ingredient table. An unresolved reference falls back to showing its id so the
 * problem is visible on the page as well as in `npm run validate`.
 */
export function scaleIngredients(
  recipe: Recipe,
  portions: number,
  ingredientsById: Record<string, Ingredient>,
): ScaledLine[] {
  const factor = scaleFactor(portions, recipe.baseServings);

  return recipe.ingredients.map((line) => {
    const ingredient = ingredientsById[line.ingredientId];
    const name = ingredient ? ingredient.name : line.ingredientId;
    const qty = line.qty * factor;

    return {
      ingredientId: line.ingredientId,
      label: line.prep ? `${name}, ${line.prep}` : name,
      qty,
      unit: line.unit,
      display: formatAmount(qty, line.unit),
    };
  });
}
