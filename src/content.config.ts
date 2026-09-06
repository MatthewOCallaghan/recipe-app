import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';
import { MEAL_TYPES } from './lib/types';

/**
 * The data contract. A record that does not match these schemas fails the
 * build. Referential integrity between the two collections (and duplicate id
 * detection) is checked separately by scripts/validate-data.mjs, which runs as
 * the `prebuild` step.
 *
 * Arrays are allowed to be empty on purpose: `npm run add:recipe` scaffolds a
 * stub with empty ingredients/method/cooking so you can fill it in without the
 * dev server refusing to start. validate-data.mjs reports those as incomplete.
 */

const nutrition = z.object({
  basis: z.number().positive(),
  unit: z.string(),
  kcal: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fat: z.number().nonnegative(),
});

const ingredients = defineCollection({
  loader: file('src/data/ingredients.json'),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    defaultUnit: z.string(),
    nutrition: nutrition.nullable().default(null),
  }),
});

const recipes = defineCollection({
  loader: file('src/data/recipes.json'),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    mealType: z.enum(MEAL_TYPES),
    baseServings: z.number().int().positive(),
    prepMins: z.number().int().nonnegative(),
    cookMins: z.number().int().nonnegative(),
    freezerLifeMonths: z.number().positive().nullable().default(null),
    image: z.string().nullable().default(null),
    ingredients: z.array(
      z.object({
        ingredientId: z.string().min(1),
        qty: z.number().positive(),
        unit: z.string(),
        prep: z.string().optional(),
      }),
    ),
    method: z.array(z.string()),
    cooking: z.object({
      standard: z.array(z.string()),
      fromFrozen: z.array(z.string()).optional(),
    }),
  }),
});

export const collections = { ingredients, recipes };
