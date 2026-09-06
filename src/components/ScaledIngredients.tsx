import { useStore } from '@nanostores/preact';
import { $portions, getPortions } from '../lib/store';
import { scaleIngredients } from '../lib/scale';
import type { Ingredient, Recipe } from '../lib/types';

interface Props {
  recipe: Recipe;
  /** Only the ingredients this recipe references, keyed by id. */
  ingredientsById: Record<string, Ingredient>;
}

/** The recipe's ingredient list, rescaled whenever the portion count changes. */
export default function ScaledIngredients({ recipe, ingredientsById }: Props) {
  const portions = useStore($portions);
  const count = getPortions(portions, recipe.id, recipe.baseServings);
  const lines = scaleIngredients(recipe, count, ingredientsById);

  if (lines.length === 0) {
    return <p class="page-intro">No ingredients recorded yet.</p>;
  }

  return (
    <div class="ingredient-list">
      {lines.map((line) => (
        <div class="ingredient-row" key={line.ingredientId + line.unit}>
          <span>{line.label}</span>
          <span class="ingredient-row__amount">{line.display}</span>
        </div>
      ))}
    </div>
  );
}
