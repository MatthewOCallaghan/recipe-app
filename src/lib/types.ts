/**
 * Domain types for the recipe/ingredient store.
 *
 * These are hand-written rather than inferred from the content collections so
 * that the logic in `src/lib/` (and its tests) can be used without pulling in
 * Astro. `src/content.config.ts` holds the Zod schemas that enforce this shape
 * at build time — the two must be kept in step.
 */

export const MEAL_TYPES = ['Main', 'Side', 'Dessert'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

/**
 * Nutrition figures for `basis` units of the ingredient — conventionally per
 * 100g / 100ml, or per 1 item for things counted rather than weighed.
 * `null` on an ingredient means "not recorded yet", which is every ingredient
 * today; see `src/lib/nutrition.ts` for how that propagates.
 */
export interface Nutrition {
  basis: number;
  unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Ingredient {
  /** Slug primary key, e.g. "chicken-breast". Unique across ingredients.json. */
  id: string;
  name: string;
  category: string;
  /** The unit this ingredient is normally measured in. "" means counted. */
  defaultUnit: string;
  nutrition: Nutrition | null;
}

/** One line of a recipe's ingredient list, referencing the shared table. */
export interface RecipeIngredient {
  ingredientId: string;
  qty: number;
  unit: string;
  /** Per-recipe preparation note, e.g. "diced". Shown on the recipe only. */
  prep?: string;
}

export interface RecipeCooking {
  /** Cooking now, or from defrosted — the same thing once at fridge temperature. */
  standard: string[];
  /** Omitted entirely for recipes that cannot be cooked from frozen. */
  fromFrozen?: string[];
}

export interface Recipe {
  /** Slug primary key, e.g. "chicken-mushroom-lasagne". Also the URL. */
  id: string;
  name: string;
  mealType: MealType;
  baseServings: number;
  prepMins: number;
  cookMins: number;
  /** null when the dish does not freeze. */
  freezerLifeMonths: number | null;
  /** Filename under public/images/recipes/, or null for the placeholder band. */
  image: string | null;
  ingredients: RecipeIngredient[];
  method: string[];
  cooking: RecipeCooking;
}

export type CookMode = 'standard' | 'fromFrozen';
