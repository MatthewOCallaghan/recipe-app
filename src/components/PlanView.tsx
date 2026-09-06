import { useStore } from '@nanostores/preact';
import Stepper from './Stepper';
import {
  $plan,
  $portions,
  changePortions,
  getPortions,
  removeFromPlan,
} from '../lib/store';
import { buildShoppingList, type PlanEntry } from '../lib/shopping-list';
import { href, recipeHref } from '../lib/paths';
import type { Ingredient, Recipe } from '../lib/types';

interface Props {
  recipes: Recipe[];
  ingredientsById: Record<string, Ingredient>;
}

/**
 * The whole My Plan page. Rendered client-only because every part of it comes
 * out of localStorage — server-rendering it would flash the empty state on
 * every load.
 */
export default function PlanView({ recipes, ingredientsById }: Props) {
  const plan = useStore($plan);
  const portions = useStore($portions);

  // Follow the plan's own order so recipes stay where you added them.
  const entries: PlanEntry[] = plan
    .map((id) => recipes.find((recipe) => recipe.id === id))
    .filter((recipe): recipe is Recipe => Boolean(recipe))
    .map((recipe) => ({
      recipe,
      portions: getPortions(portions, recipe.id, recipe.baseServings),
    }));

  if (entries.length === 0) {
    return (
      <div class="empty-state">
        <p>No recipes selected yet.</p>
        <a class="button-primary" href={href('/')}>
          Browse recipes
        </a>
      </div>
    );
  }

  const shoppingList = buildShoppingList(entries, ingredientsById);

  return (
    <div class="plan-layout">
      <section>
        <h2 class="section-label">Recipes in this plan</h2>
        <div class="plan-rows">
          {entries.map(({ recipe, portions: count }) => (
            <div class="plan-row" key={recipe.id}>
              <a class="plan-row__name" href={recipeHref(recipe.id)}>
                {recipe.name}
              </a>
              <div class="plan-row__controls">
                <Stepper
                  value={count}
                  name={`portions for ${recipe.name}`}
                  label={`${count} ${count === 1 ? 'portion' : 'portions'}`}
                  onChange={(delta) => changePortions(recipe.id, delta, recipe.baseServings)}
                />
                <button
                  type="button"
                  class="plan-row__remove"
                  onClick={() => removeFromPlan(recipe.id)}
                >
                  remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="section-label">Combined shopping list</h2>
        <div class="shopping-list">
          {shoppingList.map((line) => (
            <div class="shopping-row" key={line.ingredientId + line.unit}>
              <div>
                <div class="shopping-row__name">{line.name}</div>
                <div class="shopping-row__sources">{line.sources}</div>
              </div>
              <div class="shopping-row__amount">{line.display}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
