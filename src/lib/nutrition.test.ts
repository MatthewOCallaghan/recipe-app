import { describe, expect, it } from 'vitest';
import { perPortion } from './nutrition';
import { indexById } from './scale';
import { ingredient, nutrition, recipe } from './fixtures.test-utils';

describe('perPortion', () => {
  it('returns null while no ingredient has nutrition recorded', () => {
    const ingredients = indexById([ingredient('onion')]);
    const r = recipe('r', { ingredients: [{ ingredientId: 'onion', qty: 100, unit: 'g' }] });

    expect(perPortion(r, ingredients)).toBeNull();
  });

  it('returns null when only some ingredients have figures', () => {
    const ingredients = indexById([
      ingredient('chicken', { nutrition: nutrition() }),
      ingredient('onion'),
    ]);
    const r = recipe('r', {
      ingredients: [
        { ingredientId: 'chicken', qty: 100, unit: 'g' },
        { ingredientId: 'onion', qty: 100, unit: 'g' },
      ],
    });

    expect(perPortion(r, ingredients)).toBeNull();
  });

  it('sums per-100g figures and divides by the base servings', () => {
    const ingredients = indexById([
      ingredient('chicken', {
        nutrition: nutrition({ kcal: 165, protein: 31, carbs: 0, fat: 3.6 }),
      }),
    ]);
    // 400g at per-100g figures = 4x, over 4 servings = 1x per portion.
    const r = recipe('r', {
      baseServings: 4,
      ingredients: [{ ingredientId: 'chicken', qty: 400, unit: 'g' }],
    });

    expect(perPortion(r, ingredients)).toEqual({
      kcal: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
    });
  });

  it('converts kg lines against per-100g figures', () => {
    const ingredients = indexById([
      ingredient('mince', { nutrition: nutrition({ kcal: 200, protein: 20, carbs: 0, fat: 12 }) }),
    ]);
    // 1kg = 1000g = 10x per-100g, over 10 servings = 1x per portion.
    const r = recipe('r', {
      baseServings: 10,
      ingredients: [{ ingredientId: 'mince', qty: 1, unit: 'kg' }],
    });

    expect(perPortion(r, ingredients)?.kcal).toBe(200);
  });

  it('handles counted ingredients recorded per item', () => {
    const ingredients = indexById([
      ingredient('egg', {
        defaultUnit: '',
        nutrition: nutrition({ basis: 1, unit: '', kcal: 70, protein: 6, carbs: 0, fat: 5 }),
      }),
    ]);
    const r = recipe('r', {
      baseServings: 2,
      ingredients: [{ ingredientId: 'egg', qty: 4, unit: '' }],
    });

    expect(perPortion(r, ingredients)).toEqual({ kcal: 140, protein: 12, carbs: 0, fat: 10 });
  });

  it('returns null when a line cannot be reconciled with the recorded unit', () => {
    const ingredients = indexById([
      ingredient('olive-oil', { nutrition: nutrition({ basis: 100, unit: 'ml' }) }),
    ]);
    // Tablespoons against per-100ml figures would need a density we do not have.
    const r = recipe('r', {
      ingredients: [{ ingredientId: 'olive-oil', qty: 2, unit: 'tbsp' }],
    });

    expect(perPortion(r, ingredients)).toBeNull();
  });

  it('returns null for a recipe with no ingredients yet', () => {
    expect(perPortion(recipe('stub'), {})).toBeNull();
  });
});
