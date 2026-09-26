import { describe, expect, it } from 'vitest';
import {
  filterByIngredients,
  ingredientOptions,
  normalise,
  suggestIngredients,
  type IngredientOption,
} from './ingredient-filter';
import { indexById } from './scale';
import { ingredient, recipe } from './fixtures.test-utils';

const ingredients = indexById([
  ingredient('chicken-breast', { name: 'Chicken breast' }),
  ingredient('leek', { name: 'Leek', defaultUnit: '' }),
  ingredient('onion', { name: 'Onion', defaultUnit: '' }),
  ingredient('green-chilli', { name: 'Green chilli', defaultUnit: '' }),
  ingredient('creme-fraiche', { name: 'Crème fraîche' }),
]);

const options: IngredientOption[] = [
  { id: 'chicken-breast', name: 'Chicken breast' },
  { id: 'green-chilli', name: 'Green chilli' },
  { id: 'leek', name: 'Leek' },
  { id: 'onion', name: 'Onion' },
];

function card(id: string, ingredientIds: string[]) {
  return { id, ingredientIds };
}

describe('normalise', () => {
  it('ignores case and punctuation so "creme fraiche" matches "Crème fraîche"', () => {
    expect(normalise('Green Chilli')).toBe('green chilli');
    expect(normalise('  Chicken-breast ')).toBe('chicken breast');
  });
});

describe('ingredientOptions', () => {
  it('lists each used ingredient once, sorted by name', () => {
    const pie = recipe('pie', {
      ingredients: [
        { ingredientId: 'onion', qty: 1, unit: '' },
        { ingredientId: 'chicken-breast', qty: 500, unit: 'g' },
      ],
    });
    const soup = recipe('soup', {
      ingredients: [
        { ingredientId: 'leek', qty: 2, unit: '' },
        { ingredientId: 'onion', qty: 1, unit: '' },
      ],
    });

    expect(ingredientOptions([pie, soup], ingredients)).toEqual([
      { id: 'chicken-breast', name: 'Chicken breast' },
      { id: 'leek', name: 'Leek' },
      { id: 'onion', name: 'Onion' },
    ]);
  });

  it('leaves out ingredients no recipe uses', () => {
    const pie = recipe('pie', { ingredients: [{ ingredientId: 'onion', qty: 1, unit: '' }] });

    expect(ingredientOptions([pie], ingredients).map((o) => o.id)).toEqual(['onion']);
  });

  it('falls back to the id when a reference is unresolved', () => {
    const pie = recipe('pie', { ingredients: [{ ingredientId: 'mystery-item', qty: 1, unit: '' }] });

    expect(ingredientOptions([pie], ingredients)).toEqual([
      { id: 'mystery-item', name: 'mystery-item' },
    ]);
  });
});

describe('suggestIngredients', () => {
  it('offers everything when nothing has been typed', () => {
    expect(suggestIngredients(options, '').map((o) => o.id)).toEqual([
      'chicken-breast',
      'green-chilli',
      'leek',
      'onion',
    ]);
  });

  it('ranks names starting with the query above ones merely containing it', () => {
    expect(suggestIngredients(options, 'chi').map((o) => o.id)).toEqual([
      'chicken-breast',
      'green-chilli',
    ]);
  });

  it('matches case-insensitively on any part of the name', () => {
    expect(suggestIngredients(options, 'ONI').map((o) => o.id)).toEqual(['onion']);
  });

  it('drops ingredients already picked', () => {
    expect(suggestIngredients(options, 'chi', ['chicken-breast']).map((o) => o.id)).toEqual([
      'green-chilli',
    ]);
  });

  it('caps the list at the limit', () => {
    expect(suggestIngredients(options, '', [], 2)).toHaveLength(2);
  });

  it('returns nothing when the query matches no ingredient', () => {
    expect(suggestIngredients(options, 'rhubarb')).toEqual([]);
  });
});

describe('filterByIngredients', () => {
  const cards = [
    card('chicken-leek-pie', ['chicken-breast', 'leek', 'onion']),
    card('leek-soup', ['leek', 'onion']),
    card('chilli', ['green-chilli', 'onion']),
  ];

  it('leaves the list untouched when nothing is selected', () => {
    expect(filterByIngredients(cards, [])).toEqual(cards);
  });

  it('keeps only recipes using the selected ingredient', () => {
    expect(filterByIngredients(cards, ['leek']).map((r) => r.id)).toEqual([
      'chicken-leek-pie',
      'leek-soup',
    ]);
  });

  it('narrows further with each ingredient added, requiring all of them', () => {
    expect(filterByIngredients(cards, ['leek', 'chicken-breast']).map((r) => r.id)).toEqual([
      'chicken-leek-pie',
    ]);
  });

  it('returns nothing when no recipe has every selected ingredient', () => {
    expect(filterByIngredients(cards, ['green-chilli', 'leek'])).toEqual([]);
  });
});
