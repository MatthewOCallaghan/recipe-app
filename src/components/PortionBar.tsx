import { useStore } from '@nanostores/preact';
import Stepper from './Stepper';
import { $plan, $portions, changePortions, getPortions, togglePlan } from '../lib/store';

interface Props {
  recipeId: string;
  recipeName: string;
  baseServings: number;
}

/**
 * The portions control on a recipe page. Writes to the same store the
 * ingredient list reads from, so the quantities below update as you step.
 */
export default function PortionBar({ recipeId, recipeName, baseServings }: Props) {
  const portions = useStore($portions);
  const plan = useStore($plan);

  const count = getPortions(portions, recipeId, baseServings);
  const inPlan = plan.includes(recipeId);

  return (
    <div class="portion-bar">
      <span class="portion-bar__label">Portions:</span>
      <Stepper
        large
        value={count}
        name={`portions for ${recipeName}`}
        label={String(count)}
        onChange={(delta) => changePortions(recipeId, delta, baseServings)}
      />
      <button
        type="button"
        class="plan-button"
        aria-pressed={inPlan}
        onClick={() => togglePlan(recipeId)}
      >
        {inPlan ? '✓ In your plan' : '+ Add to plan'}
      </button>
    </div>
  );
}
