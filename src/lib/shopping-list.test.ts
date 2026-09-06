import { describe, expect, it } from 'vitest';
import { buildShoppingList } from './shopping-list';
import { indexById } from './scale';
import { ingredient, recipe } from './fixtures.test-utils';

const ingredients = indexById([
  ingredient('onion', { name: 'Onion', defaultUnit: '' }),
  ingredient('olive-oil', { name: 'Olive oil', defaultUnit: 'ml' }),
  ingredient('cheddar', { name: 'Cheddar', defaultUnit: 'g' }),
  ingredient('beef-mince', { name: 'Beef mince' }),
]);

describe('buildShoppingList', () => {
  it('merges an ingredient used by two recipes into one summed line', () => {
    const chilli = recipe('chilli', {
      name: 'Veggie Chilli',
      baseServings: 4,
      ingredients: [{ ingredientId: 'onion', qty: 1, unit: '', prep: 'diced' }],
    });
    const enchiladas = recipe('enchiladas', {
      name: 'Beef Enchiladas',
      baseServings: 4,
      ingredients: [{ ingredientId: 'onion', qty: 2, unit: '', prep: 'sliced' }],
    });

    const list = buildShoppingList(
      [
        { recipe: chilli, portions: 4 },
        { recipe: enchiladas, portions: 4 },
      ],
      ingredients,
    );

    expect(list).toHaveLength(1);
    expect(list[0].display).toBe('3');
    expect(list[0].sources).toBe('Veggie Chilli + Beef Enchiladas');
  });

  it('drops prep notes so the same ingredient never splits into two lines', () => {
    const a = recipe('a', {
      ingredients: [{ ingredientId: 'onion', qty: 1, unit: '', prep: 'diced' }],
    });
    const b = recipe('b', {
      ingredients: [{ ingredientId: 'onion', qty: 1, unit: '', prep: 'finely chopped' }],
    });

    const list = buildShoppingList(
      [
        { recipe: a, portions: 4 },
        { recipe: b, portions: 4 },
      ],
      ingredients,
    );

    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Onion');
  });

  it('scales each recipe by its own portion count before summing', () => {
    const a = recipe('a', {
      baseServings: 4,
      ingredients: [{ ingredientId: 'cheddar', qty: 200, unit: 'g' }],
    });
    const b = recipe('b', {
      baseServings: 6,
      ingredients: [{ ingredientId: 'cheddar', qty: 150, unit: 'g' }],
    });

    // a doubled -> 400g, b at 12 portions -> 300g
    const list = buildShoppingList(
      [
        { recipe: a, portions: 8 },
        { recipe: b, portions: 12 },
      ],
      ingredients,
    );

    expect(list[0].display).toBe('700g');
  });

  it('converts between kg and g when summing', () => {
    const a = recipe('a', {
      baseServings: 4,
      ingredients: [{ ingredientId: 'beef-mince', qty: 1, unit: 'kg' }],
    });
    const b = recipe('b', {
      baseServings: 4,
      ingredients: [{ ingredientId: 'beef-mince', qty: 500, unit: 'g' }],
    });

    const list = buildShoppingList(
      [
        { recipe: a, portions: 4 },
        { recipe: b, portions: 4 },
      ],
      ingredients,
    );

    expect(list).toHaveLength(1);
    expect(list[0].display).toBe('1500g');
  });

  it('keeps genuinely incompatible measures on separate lines', () => {
    const a = recipe('a', {
      baseServings: 4,
      ingredients: [{ ingredientId: 'olive-oil', qty: 100, unit: 'ml' }],
    });
    const b = recipe('b', {
      baseServings: 4,
      ingredients: [{ ingredientId: 'olive-oil', qty: 2, unit: 'tbsp' }],
    });

    const list = buildShoppingList(
      [
        { recipe: a, portions: 4 },
        { recipe: b, portions: 4 },
      ],
      ingredients,
    );

    expect(list.map((line) => line.display)).toEqual(['100ml', '2 tbsp']);
  });

  it('sorts lines by ingredient name', () => {
    const all = recipe('all', {
      baseServings: 4,
      ingredients: [
        { ingredientId: 'onion', qty: 1, unit: '' },
        { ingredientId: 'beef-mince', qty: 500, unit: 'g' },
        { ingredientId: 'cheddar', qty: 200, unit: 'g' },
      ],
    });

    const list = buildShoppingList([{ recipe: all, portions: 4 }], ingredients);
    expect(list.map((line) => line.name)).toEqual(['Beef mince', 'Cheddar', 'Onion']);
  });

  it('returns nothing for an empty plan', () => {
    expect(buildShoppingList([], ingredients)).toEqual([]);
  });
});
