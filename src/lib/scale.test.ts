import { describe, expect, it } from 'vitest';
import { indexById, scaleFactor, scaleIngredients } from './scale';
import { ingredient, recipe } from './fixtures.test-utils';

describe('scaleFactor', () => {
  it('is the ratio of chosen portions to the recipe base', () => {
    expect(scaleFactor(9, 6)).toBe(1.5);
    expect(scaleFactor(6, 6)).toBe(1);
    expect(scaleFactor(2, 4)).toBe(0.5);
  });

  it('falls back to 1 rather than dividing by zero', () => {
    expect(scaleFactor(4, 0)).toBe(1);
  });
});

describe('scaleIngredients', () => {
  const ingredients = indexById([
    ingredient('chicken-breast', { name: 'Chicken breast' }),
    ingredient('onion', { name: 'Onion', defaultUnit: '' }),
  ]);

  const lasagne = recipe('lasagne', {
    baseServings: 6,
    ingredients: [
      { ingredientId: 'chicken-breast', qty: 600, unit: 'g', prep: 'diced' },
      { ingredientId: 'onion', qty: 2, unit: '' },
    ],
  });

  it('scales quantities and formats them for display', () => {
    const lines = scaleIngredients(lasagne, 9, ingredients);
    expect(lines[0].display).toBe('900g');
    expect(lines[1].display).toBe('3');
  });

  it('leaves quantities untouched at the base serving count', () => {
    const lines = scaleIngredients(lasagne, 6, ingredients);
    expect(lines.map((line) => line.display)).toEqual(['600g', '2']);
  });

  it('appends the per-recipe prep note to the ingredient name', () => {
    const lines = scaleIngredients(lasagne, 6, ingredients);
    expect(lines[0].label).toBe('Chicken breast, diced');
    expect(lines[1].label).toBe('Onion');
  });

  it('falls back to the id when a reference does not resolve', () => {
    const broken = recipe('broken', {
      ingredients: [{ ingredientId: 'ghost-ingredient', qty: 1, unit: 'g' }],
    });
    expect(scaleIngredients(broken, 4, ingredients)[0].label).toBe('ghost-ingredient');
  });
});
