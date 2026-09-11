import { persistentJSON } from '@nanostores/persistent';
import { atom, onMount } from 'nanostores';
import { MAX_PORTIONS, MIN_PORTIONS } from '../config';
import { MEAL_TYPES, type MealType } from './types';

/**
 * Client state shared across every island and every page.
 *
 * Persisting to localStorage is what lets portions and plan selections survive
 * navigation between /, /recipes/[id] and /plan — the design prototype was a
 * single component holding this in memory, but here each page is its own
 * document. The store falls back to an in-memory object during SSR, so islands
 * pre-render safely and pick up the real values on hydration.
 */

/** Recipe id -> chosen portion count. Absent means "still at baseServings". */
export const $portions = persistentJSON<Record<string, number>>('bk:portions', {});

/** Recipe ids currently added to the plan. */
export const $plan = persistentJSON<string[]>('bk:plan', []);

/** The course chosen on the recipes grid — a meal type, or all of them. */
export type RecipeFilter = 'All' | MealType;

const RECIPE_FILTER_KEY = 'bk:recipe-filter';

function readSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    // No sessionStorage during SSR, and blocked entirely when the browser is
    // set to refuse site data. Neither is worth breaking the page over.
    return null;
  }
}

function writeSession(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // As above: the filter just will not survive the next navigation.
  }
}

/**
 * The recipes grid's course filter.
 *
 * Deliberately sessionStorage rather than localStorage: the choice should
 * survive clicking into a recipe and coming back, but a later visit starts
 * fresh on "All". It is hand-rolled instead of using `persistentJSON` because
 * that library's storage engine is global — pointing it at sessionStorage
 * would drag portions and the plan along with it.
 */
export const $recipeFilter = atom<RecipeFilter>('All');

/** Guards against a stale or hand-edited value left in sessionStorage. */
export function isRecipeFilter(value: unknown): value is RecipeFilter {
  return value === 'All' || MEAL_TYPES.includes(value as MealType);
}

/**
 * Restore the session's choice once an island subscribes, which only happens
 * in the browser — server-rendered markup therefore always shows "All".
 *
 * The set is deferred by a tick on purpose. Applied straight from the mount
 * callback it lands inside Preact's hydration commit, where updates to
 * attributes of already-rendered DOM are dropped: the grid would filter down
 * but the pressed pill would stay stuck on "All". A tick later it is an
 * ordinary update and the whole island agrees.
 */
onMount($recipeFilter, () => {
  const stored = readSession(RECIPE_FILTER_KEY);
  if (!isRecipeFilter(stored) || stored === $recipeFilter.get()) return;

  const timer = setTimeout(() => {
    // Leave a filter the user picked in the meantime alone.
    if ($recipeFilter.get() === 'All') $recipeFilter.set(stored);
  });
  return () => clearTimeout(timer);
});

export function setRecipeFilter(filter: RecipeFilter): void {
  $recipeFilter.set(filter);
  writeSession(RECIPE_FILTER_KEY, filter);
}

export function clampPortions(value: number): number {
  return Math.max(MIN_PORTIONS, Math.min(MAX_PORTIONS, Math.round(value)));
}

/** Read a recipe's portion count out of a store snapshot, defaulting sensibly. */
export function getPortions(
  portions: Record<string, number>,
  id: string,
  baseServings: number,
): number {
  return portions[id] ?? baseServings;
}

export function changePortions(id: string, delta: number, baseServings: number): void {
  const current = getPortions($portions.get(), id, baseServings);
  $portions.set({ ...$portions.get(), [id]: clampPortions(current + delta) });
}

export function togglePlan(id: string): void {
  const plan = $plan.get();
  $plan.set(plan.includes(id) ? plan.filter((entry) => entry !== id) : [...plan, id]);
}

export function removeFromPlan(id: string): void {
  $plan.set($plan.get().filter((entry) => entry !== id));
}
