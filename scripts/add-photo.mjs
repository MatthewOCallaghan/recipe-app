#!/usr/bin/env node
/**
 * Convert a photo for a recipe and point the recipe at it.
 *
 *   npm run add:photo -- creamy-chicken-casserole ~/Downloads/IMG_1234.jpg
 *
 * The photo is rotated upright from its EXIF data, scaled down to 1600px wide
 * (never up), saved as WebP in public/images/recipes/<recipe-id>.webp with
 * metadata stripped, and the recipe's "image" is set to that filename. Running
 * it again for the same recipe replaces the photo.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';
import { RECIPES_PATH, ROOT, done, fail, readJson, writeJson } from './lib.mjs';

const MAX_WIDTH = 1600;
const QUALITY = 80;

const { positionals } = parseArgs({ allowPositionals: true });
const [id, source] = positionals;

if (!id || !source) {
  fail('Usage: npm run add:photo -- <recipe-id> <path/to/photo.jpg>');
}
if (!existsSync(source)) fail(`No file at ${source}`);

const recipes = readJson(RECIPES_PATH);
const recipe = recipes.find((item) => item.id === id);
if (!recipe) fail(`No recipe with id "${id}".`);

const filename = `${id}.webp`;
const info = await sharp(source)
  .rotate()
  .resize({ width: MAX_WIDTH, withoutEnlargement: true })
  .webp({ quality: QUALITY })
  .toFile(join(ROOT, 'public/images/recipes', filename))
  .catch((error) => fail(`Could not convert ${source}: ${error.message}`));

recipe.image = filename;
writeJson(RECIPES_PATH, recipes);

done(`Saved ${filename} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB) for "${recipe.name}".`);
