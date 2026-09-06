import type { Ingredient, Recipe } from './types';
import { scaleFactor } from './scale';
import { formatAmount, normaliseAmount } from './units';

export interface PlanEntry {
  recipe: Recipe;
  portions: number;
}

export interface ShoppingLine {
  ingredientId: string;
  /** Plain ingredient name — prep notes are deliberately dropped here. */
  name: string;
  qty: number;
  unit: string;
  display: string;
  /** Recipe names that contribute to this line, e.g. "Veggie Chilli + Beef Enchiladas". */
  sources: string;
}

/**
 * Combine every recipe in the plan into one shopping list.
 *
 * Lines merge on ingredient id after unit normalisation, so 1kg in one recipe
 * and 500g in another become a single 1500g line. Because you buy onions rather
 * than diced onions, prep notes are dropped and "Onion, diced" and
 * "Onion, sliced" collapse into one entry. Quantities in genuinely different
 * measures (200g vs 2 tbsp) stay on separate lines instead of being added.
 */
export function buildShoppingList(
  entries: PlanEntry[],
  ingredientsById: Record<string, Ingredient>,
): ShoppingLine[] {
  const merged = new Map<
    string,
    { ingredientId: string; name: string; qty: number; unit: string; sources: Set<string> }
  >();

  for (const { recipe, portions } of entries) {
    const factor = scaleFactor(portions, recipe.baseServings);

    for (const line of recipe.ingredients) {
      const ingredient = ingredientsById[line.ingredientId];
      const { qty, unit } = normaliseAmount(line.qty * factor, line.unit);
      const key = `${line.ingredientId}|${unit}`;

      let entry = merged.get(key);
      if (!entry) {
        entry = {
          ingredientId: line.ingredientId,
          name: ingredient ? ingredient.name : line.ingredientId,
          qty: 0,
          unit,
          sources: new Set<string>(),
        };
        merged.set(key, entry);
      }

      entry.qty += qty;
      entry.sources.add(recipe.name);
    }
  }

  return [...merged.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => ({
      ingredientId: entry.ingredientId,
      name: entry.name,
      qty: entry.qty,
      unit: entry.unit,
      display: formatAmount(entry.qty, entry.unit),
      sources: [...entry.sources].join(' + '),
    }));
}
