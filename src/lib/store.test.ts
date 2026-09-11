import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanStores } from 'nanostores';
import { $recipeFilter, isRecipeFilter, setRecipeFilter } from './store';

/** Minimal stand-in for the browser's sessionStorage. */
function fakeSessionStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    clear: () => data.clear(),
    key: (index: number) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
  } satisfies Storage;
}

function useSessionStorage(storage: Storage | undefined): void {
  vi.stubGlobal('sessionStorage', storage);
}

/**
 * Simulate loading a page in the same tab: the store starts from its initial
 * value again, and an island subscribing to it is what runs `onMount`.
 * Stays subscribed, since that is what an island on screen would be.
 */
function loadPage(): void {
  cleanStores($recipeFilter);
  $recipeFilter.set('All');
  $recipeFilter.listen(() => {});
}

/** Run the tick the restore is deferred by; see the note in `store.ts`. */
function afterHydration(): void {
  vi.runAllTimers();
}

beforeEach(() => {
  vi.useFakeTimers();
  useSessionStorage(fakeSessionStorage());
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  cleanStores($recipeFilter);
});

describe('isRecipeFilter', () => {
  it('accepts All and every meal type', () => {
    expect(isRecipeFilter('All')).toBe(true);
    expect(isRecipeFilter('Main')).toBe(true);
    expect(isRecipeFilter('Dessert')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isRecipeFilter('Starter')).toBe(false);
    expect(isRecipeFilter('')).toBe(false);
    expect(isRecipeFilter(null)).toBe(false);
  });
});

describe('$recipeFilter', () => {
  it('starts on All', () => {
    loadPage();
    afterHydration();

    expect($recipeFilter.get()).toBe('All');
  });

  it('restores the filter chosen earlier in the session', () => {
    setRecipeFilter('Side');

    // A fresh page in the same tab: new store, same sessionStorage.
    loadPage();
    afterHydration();

    expect($recipeFilter.get()).toBe('Side');
  });

  it('still matches the server-rendered All until hydration has finished', () => {
    setRecipeFilter('Side');

    loadPage();

    expect($recipeFilter.get()).toBe('All');
  });

  it('keeps a filter picked before the restore lands', () => {
    setRecipeFilter('Side');

    loadPage();
    setRecipeFilter('Dessert');
    afterHydration();

    expect($recipeFilter.get()).toBe('Dessert');
  });

  it('ignores a stored value that is not a meal type', () => {
    useSessionStorage(fakeSessionStorage({ 'bk:recipe-filter': 'Brunch' }));

    loadPage();
    afterHydration();

    expect($recipeFilter.get()).toBe('All');
  });

  it('does not throw when sessionStorage is unavailable', () => {
    useSessionStorage(undefined);

    expect(() => {
      loadPage();
      setRecipeFilter('Dessert');
      afterHydration();
    }).not.toThrow();
    expect($recipeFilter.get()).toBe('Dessert');
  });
});
