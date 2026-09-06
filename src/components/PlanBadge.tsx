import { useStore } from '@nanostores/preact';
import { $plan } from '../lib/store';

/** The count bubble on the "My Plan" nav item; hidden when the plan is empty. */
export default function PlanBadge() {
  const plan = useStore($plan);
  if (plan.length === 0) return null;
  return <span class="plan-badge">{plan.length}</span>;
}
