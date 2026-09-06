import { useState } from 'preact/hooks';
import type { CookMode, RecipeCooking } from '../lib/types';

interface Props {
  cooking: RecipeCooking;
}

const LABELS: Record<CookMode, string> = {
  standard: 'Fresh or defrosted',
  fromFrozen: 'From frozen',
};

/**
 * "How to cook". The prototype had three tabs, but cooking straight away and
 * cooking from defrosted are the same job, so they are one mode here. The
 * from-frozen tab only appears for recipes that can actually be cooked from
 * frozen; when there is only one mode the tab row is dropped entirely.
 */
export default function CookMethodTabs({ cooking }: Props) {
  const [mode, setMode] = useState<CookMode>('standard');

  const modes: CookMode[] = cooking.fromFrozen?.length
    ? ['standard', 'fromFrozen']
    : ['standard'];
  const active = modes.includes(mode) ? mode : 'standard';
  const steps = (active === 'fromFrozen' ? cooking.fromFrozen : cooking.standard) ?? [];

  return (
    <>
      {modes.length > 1 && (
        <div class="pill-tabs cook-tabs" role="tablist" aria-label="How to cook">
          {modes.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              class="pill-tab"
              aria-selected={active === option}
              onClick={() => setMode(option)}
            >
              {LABELS[option]}
            </button>
          ))}
        </div>
      )}

      <div class="cook-panel">
        {steps.length === 0 ? (
          <p>No cooking instructions recorded yet.</p>
        ) : (
          <ol class="steps">
            {steps.map((text, index) => (
              <li class="steps__item" key={text}>
                <span class="steps__n">{index + 1}.</span>
                <span>{text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
