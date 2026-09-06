#!/usr/bin/env node
/**
 * Append an ingredient to src/data/ingredients.json.
 *
 *   npm run add:ingredient -- "Chicken breast" --unit g
 *   npm run add:ingredient -- "Onion" --unit ""
 *
 * The id is slugified from the name and must be unique — this is where
 * uniqueness is enforced at authoring time; validate-data.mjs is the backstop
 * for hand-edited files.
 */
import { parseArgs } from 'node:util';
import { INGREDIENTS_PATH, done, fail, readJson, slugify, writeJson } from './lib.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    unit: { type: 'string' },
  },
});

const name = positionals[0]?.trim();
if (!name) {
  fail('Usage: npm run add:ingredient -- "Chicken breast" --unit g');
}

const id = slugify(name);
if (!id) fail(`Could not derive an id from "${name}".`);

const ingredients = readJson(INGREDIENTS_PATH);

if (ingredients.some((item) => item.id === id)) {
  fail(`An ingredient with id "${id}" already exists.`);
}
if (ingredients.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
  fail(`An ingredient named "${name}" already exists.`);
}

ingredients.push({
  id,
  name,
  // "" means the ingredient is counted rather than measured (2 onions).
  defaultUnit: values.unit ?? '',
  // Filled in later; see src/lib/nutrition.ts for the shape.
  nutrition: null,
});

ingredients.sort((a, b) => a.name.localeCompare(b.name));
writeJson(INGREDIENTS_PATH, ingredients);

done(`Added ingredient "${name}" as "${id}".`);
