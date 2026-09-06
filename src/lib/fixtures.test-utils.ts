import type { Ingredient, Nutrition, Recipe } from './types';

/**
 * Fixtures for the unit tests only. Real data lives in src/data/*.json, which
 * ships empty until the recipe collection is filled in.
 */

export function ingredient(id: string, over: Partial<Ingredient> = {}): Ingredient {
  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
    category: 'Test',
    defaultUnit: 'g',
    nutrition: null,
    ...over,
  };
}

export function nutrition(over: Partial<Nutrition> = {}): Nutrition {
  return { basis: 100, unit: 'g', kcal: 100, protein: 10, carbs: 5, fat: 2, ...over };
}

export function recipe(id: string, over: Partial<Recipe> = {}): Recipe {
  return {
    id,
    name: id,
    mealType: 'Main',
    baseServings: 4,
    prepMins: 10,
    cookMins: 20,
    freezerLifeMonths: 3,
    image: null,
    ingredients: [],
    method: ['Cook it.'],
    cooking: { standard: ['Bake it.'] },
    ...over,
  };
}
