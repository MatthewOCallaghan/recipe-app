import type { Ingredient } from './types';

/**
 * Filtering the recipe list by the ingredients a dish contains.
 *
 * Kept out of the component so the matching rules can be unit tested without a
 * DOM, in the same way scaling and the shopping list are. The only state the
 * UI adds on top is the list of ingredient ids the user has picked.
 */

/** An ingredient the filter can offer: id for matching, name for display. */
export interface IngredientOption {
  id: string;
  name: string;
}

/** The shape the filter needs from a recipe — the cards carry exactly this. */
export interface FilterableRecipe {
  ingredientIds: string[];
}

/** Case- and punctuation-insensitive form used for every comparison. */
export function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * The ingredients worth offering: those at least one recipe actually uses,
 * sorted by name. An unresolved reference falls back to its id, the same way
 * the recipe page does, so a data problem stays visible rather than silently
 * dropping an ingredient out of the filter.
 */
export function ingredientOptions(
  recipes: { ingredients: { ingredientId: string }[] }[],
  ingredientsById: Record<string, Ingredient>,
): IngredientOption[] {
  const used = new Map<string, IngredientOption>();

  for (const recipe of recipes) {
    for (const line of recipe.ingredients) {
      if (used.has(line.ingredientId)) continue;
      const ingredient = ingredientsById[line.ingredientId];
      used.set(line.ingredientId, {
        id: line.ingredientId,
        name: ingredient ? ingredient.name : line.ingredientId,
      });
    }
  }

  return [...used.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Options matching what has been typed so far, minus the ones already picked.
 * Names starting with the query come first — typing "chi" should offer
 * "Chicken breast" before "Green chilli" — and ties stay alphabetical.
 */
export function suggestIngredients(
  options: IngredientOption[],
  query: string,
  selected: string[] = [],
  limit = 8,
): IngredientOption[] {
  const term = normalise(query);
  const chosen = new Set(selected);
  const available = options.filter((option) => !chosen.has(option.id));

  const ranked = term
    ? available
        .map((option) => ({ option, at: normalise(option.name).indexOf(term) }))
        .filter((entry) => entry.at !== -1)
        .sort((a, b) => a.at - b.at || a.option.name.localeCompare(b.option.name))
        .map((entry) => entry.option)
    : available;

  return ranked.slice(0, limit);
}

/**
 * Recipes containing *every* selected ingredient. Narrowing rather than
 * widening is what makes stacking ingredients useful: "chicken" then "leek"
 * should answer "what can I make with both", not offer more recipes.
 */
export function filterByIngredients<T extends FilterableRecipe>(
  recipes: T[],
  selected: string[],
): T[] {
  if (selected.length === 0) return recipes;
  return recipes.filter((recipe) => {
    const has = new Set(recipe.ingredientIds);
    return selected.every((id) => has.has(id));
  });
}
