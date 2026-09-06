import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(here, '..');
export const INGREDIENTS_PATH = join(ROOT, 'src/data/ingredients.json');
export const RECIPES_PATH = join(ROOT, 'src/data/recipes.json');

export const MEAL_TYPES = ['Main', 'Side', 'Dessert'];

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

/** "Chicken & Mushroom Lasagne" -> "chicken-mushroom-lasagne" */
export function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function readJson(path) {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    if (!Array.isArray(parsed)) fail(`${path} must contain a JSON array.`);
    return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') fail(`Missing data file: ${path}`);
    if (error instanceof SyntaxError) fail(`${path} is not valid JSON: ${error.message}`);
    throw error;
  }
}

export function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function error(message) {
  console.error(`${RED}x ${message}${RESET}`);
}

export function warn(message) {
  console.warn(`${YELLOW}! ${message}${RESET}`);
}

export function done(message) {
  console.log(`${GREEN}v ${message}${RESET}`);
}

export function fail(message) {
  error(message);
  process.exit(1);
}
