#!/usr/bin/env node
/**
 * Referential integrity for the recipe data — the checks the Zod schemas in
 * src/content.config.ts cannot express. Runs automatically as `prebuild`, so a
 * broken reference can never reach a deploy.
 */
import { INGREDIENTS_PATH, RECIPES_PATH, done, error, readJson, warn } from './lib.mjs';

const ingredients = readJson(INGREDIENTS_PATH);
const recipes = readJson(RECIPES_PATH);

const errors = [];
const warnings = [];

function checkUnique(items, field, label) {
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    const value = item?.[field];
    if (value === undefined) {
      errors.push(`${label}[${index}] is missing a "${field}".`);
      continue;
    }
    const key = String(value).toLowerCase();
    if (seen.has(key)) {
      errors.push(`${label} "${value}" is used by more than one record; ${field} must be unique.`);
    }
    seen.add(key);
  }
}

checkUnique(ingredients, 'id', 'ingredient id');
checkUnique(ingredients, 'name', 'ingredient name');
checkUnique(recipes, 'id', 'recipe id');

const ingredientIds = new Set(ingredients.map((item) => item?.id));
const referenced = new Set();

for (const recipe of recipes) {
  const label = recipe?.id ?? '(unnamed recipe)';

  for (const line of recipe?.ingredients ?? []) {
    if (!line?.ingredientId) {
      errors.push(`Recipe "${label}" has an ingredient line with no ingredientId.`);
      continue;
    }
    referenced.add(line.ingredientId);
    if (!ingredientIds.has(line.ingredientId)) {
      errors.push(
        `Recipe "${label}" references unknown ingredient "${line.ingredientId}". ` +
          `Create it with: npm run add:ingredient -- "<name>"`,
      );
    }
  }

  // Stubs from `npm run add:recipe` are valid but not yet finished.
  const gaps = [];
  if (!recipe?.ingredients?.length) gaps.push('ingredients');
  if (!recipe?.method?.length) gaps.push('method');
  if (!recipe?.cooking?.standard?.length) gaps.push('cooking.standard');
  if (gaps.length > 0) warnings.push(`Recipe "${label}" is incomplete: empty ${gaps.join(', ')}.`);
}

for (const ingredient of ingredients) {
  if (ingredient?.id && !referenced.has(ingredient.id)) {
    warnings.push(`Ingredient "${ingredient.id}" is not used by any recipe.`);
  }
}

warnings.forEach(warn);

if (errors.length > 0) {
  errors.forEach(error);
  console.error(`\n${errors.length} error(s) in src/data. Build stopped.`);
  process.exit(1);
}

const summary = `Data valid: ${recipes.length} recipe(s), ${ingredients.length} ingredient(s)`;
done(warnings.length > 0 ? `${summary}, ${warnings.length} warning(s).` : `${summary}.`);
