import { persistentJSON } from '@nanostores/persistent';
import { MAX_PORTIONS, MIN_PORTIONS } from '../config';

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
