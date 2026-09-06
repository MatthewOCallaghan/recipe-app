#!/usr/bin/env node
/**
 * Scaffold a recipe stub in src/data/recipes.json, then fill it in by hand.
 *
 *   npm run add:recipe -- "Beef Enchiladas" --type Main --servings 4
 *   npm run add:recipe -- "Apple Crumble" --type Dessert --servings 6 --prep 20 --cook 40
 *
 * The stub is deliberately empty rather than pre-populated: validate-data.mjs
 * reports it as incomplete until the ingredients, method and cooking steps are
 * written, so an unfinished recipe is visible but never blocks the dev server.
 *
 * Add --no-freeze for a dish that does not freeze; omit cooking.fromFrozen (as
 * this stub does) for one that freezes but cannot be cooked straight from frozen.
 */
import { parseArgs } from 'node:util';
import { MEAL_TYPES, RECIPES_PATH, done, fail, readJson, slugify, writeJson } from './lib.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    type: { type: 'string', default: 'Main' },
    servings: { type: 'string', default: '4' },
    prep: { type: 'string', default: '0' },
    cook: { type: 'string', default: '0' },
    freezer: { type: 'string', default: '3' },
    'no-freeze': { type: 'boolean', default: false },
  },
});

const name = positionals[0]?.trim();
if (!name) {
  fail('Usage: npm run add:recipe -- "Beef Enchiladas" --type Main --servings 4');
}

if (!MEAL_TYPES.includes(values.type)) {
  fail(`--type must be one of ${MEAL_TYPES.join(', ')} (got "${values.type}").`);
}

function positiveInt(value, flag) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) fail(`--${flag} must be a whole number.`);
  return parsed;
}

const servings = positiveInt(values.servings, 'servings');
if (servings < 1) fail('--servings must be at least 1.');

const id = slugify(name);
if (!id) fail(`Could not derive an id from "${name}".`);

const recipes = readJson(RECIPES_PATH);
if (recipes.some((recipe) => recipe.id === id)) {
  fail(`A recipe with id "${id}" already exists.`);
}

recipes.push({
  id,
  name,
  mealType: values.type,
  baseServings: servings,
  prepMins: positiveInt(values.prep, 'prep'),
  cookMins: positiveInt(values.cook, 'cook'),
  freezerLifeMonths: values['no-freeze'] ? null : positiveInt(values.freezer, 'freezer'),
  image: null,
  ingredients: [],
  method: [],
  cooking: {
    standard: [],
  },
});

recipes.sort((a, b) => a.name.localeCompare(b.name));
writeJson(RECIPES_PATH, recipes);

done(`Added recipe stub "${name}" as "${id}". Fill it in at src/data/recipes.json, then /recipes/${id}.`);
