import { MAX_PORTIONS, MIN_PORTIONS } from '../config';

interface Props {
  value: number;
  onChange: (delta: number) => void;
  /** Text beside the buttons, e.g. "6 portions". */
  label: string;
  /** Accessible description, e.g. "Portions for Veggie Chilli". */
  name: string;
  large?: boolean;
}

/** The −/+ portion control used on cards, the detail page and the plan rows. */
export default function Stepper({ value, onChange, label, name, large = false }: Props) {
  return (
    <div class={large ? 'stepper stepper--lg' : 'stepper'}>
      <button
        type="button"
        class="stepper__button"
        aria-label={`Decrease ${name}`}
        disabled={value <= MIN_PORTIONS}
        onClick={() => onChange(-1)}
      >
        −
      </button>
      <span class="stepper__value" aria-live="polite">
        {label}
      </span>
      <button
        type="button"
        class="stepper__button"
        aria-label={`Increase ${name}`}
        disabled={value >= MAX_PORTIONS}
        onClick={() => onChange(1)}
      >
        +
      </button>
    </div>
  );
}
