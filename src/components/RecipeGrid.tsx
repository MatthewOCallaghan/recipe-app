import { useStore } from '@nanostores/preact';
import Stepper from './Stepper';
import {
  $plan,
  $portions,
  $recipeFilter,
  changePortions,
  getPortions,
  setRecipeFilter,
  togglePlan,
  type RecipeFilter,
} from '../lib/store';
import { recipeHref, href } from '../lib/paths';
import { MEAL_TYPES, type MealType } from '../lib/types';

/** The subset of a recipe a card needs — keeps the serialised island props small. */
export interface RecipeCardData {
  id: string;
  name: string;
  mealType: MealType;
  baseServings: number;
  prepMins: number;
  cookMins: number;
  freezerLifeMonths: number | null;
  image: string | null;
}

interface Props {
  recipes: RecipeCardData[];
}

export default function RecipeGrid({ recipes }: Props) {
  const filter = useStore($recipeFilter);
  const portions = useStore($portions);
  const plan = useStore($plan);

  if (recipes.length === 0) {
    return (
      <div class="empty-state">
        <p>No recipes yet.</p>
        <p style="font-size:14px">
          Add one with <code>npm run add:recipe</code>, then fill it in inside{' '}
          <code>src/data/recipes.json</code>.
        </p>
      </div>
    );
  }

  // Only offer a filter for meal types that actually exist, and only once
  // there is more than one to choose between.
  const presentTypes = MEAL_TYPES.filter((type) => recipes.some((r) => r.mealType === type));
  const showFilter = presentTypes.length > 1;
  // A filter carried over from earlier in the session may name a meal type this
  // grid no longer has, which would leave nothing on screen — fall back to All.
  const active: RecipeFilter = filter === 'All' || presentTypes.includes(filter) ? filter : 'All';
  const visible = active === 'All' ? recipes : recipes.filter((r) => r.mealType === active);

  return (
    <>
      {showFilter && (
        <div class="pill-tabs recipe-filter" role="group" aria-label="Filter by meal type">
          {(['All', ...presentTypes] as RecipeFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              class="pill-tab"
              aria-pressed={active === option}
              onClick={() => setRecipeFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <div class="recipe-grid">
        {visible.map((recipe) => {
          const count = getPortions(portions, recipe.id, recipe.baseServings);
          const inPlan = plan.includes(recipe.id);

          return (
            <article class="recipe-card" key={recipe.id}>
              <a class="recipe-card__photo photo" href={recipeHref(recipe.id)} aria-hidden="true" tabIndex={-1}
                 style={recipe.image ? `background-image:url('${href(`/images/recipes/${recipe.image}`)}')` : undefined}>
                {!recipe.image && <span class="photo__label">photo: {recipe.name}</span>}
              </a>

              <div class="recipe-card__body">
                <div class="recipe-card__tags">
                  <span class="meal-pill">{recipe.mealType}</span>
                </div>

                <a class="recipe-card__name" href={recipeHref(recipe.id)}>
                  {recipe.name}
                </a>

                <div class="recipe-card__meta">
                  <span>
                    ⏱ {recipe.prepMins}+{recipe.cookMins} min
                  </span>
                  {recipe.freezerLifeMonths !== null && (
                    <span>❄ freezes {recipe.freezerLifeMonths} mo</span>
                  )}
                </div>

                <div class="recipe-card__footer">
                  <Stepper
                    value={count}
                    name={`portions for ${recipe.name}`}
                    label={`${count} ${count === 1 ? 'portion' : 'portions'}`}
                    onChange={(delta) => changePortions(recipe.id, delta, recipe.baseServings)}
                  />

                  <button
                    type="button"
                    class="plan-check"
                    aria-pressed={inPlan}
                    onClick={() => togglePlan(recipe.id)}
                  >
                    <span class="plan-check__box" aria-hidden="true">
                      {inPlan ? '✓' : ''}
                    </span>
                    <span class="plan-check__label">add to plan</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
