import { useId, useMemo, useRef, useState } from 'preact/hooks';
import { suggestIngredients, type IngredientOption } from '../lib/ingredient-filter';

/**
 * Pick one or more ingredients to narrow the recipe list by. Typing filters a
 * suggestion list drawn from the ingredients recipes actually use, so you can
 * only search for something that exists; picking one turns it into a chip and
 * clears the box, ready for the next.
 *
 * The chosen ids live in the parent (RecipeGrid) alongside the meal-type
 * filter — this component owns only the typing and the open/highlight state of
 * the suggestion list.
 */

interface Props {
  options: IngredientOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

const SUGGESTION_LIMIT = 8;

export default function IngredientFilter({ options, selected, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Set while returning focus to the box after a pick, so the focus handler
  // does not immediately reopen the list the pick just closed.
  const refocusing = useRef(false);
  const listId = useId();

  const namesById = useMemo(
    () => Object.fromEntries(options.map((option) => [option.id, option.name])),
    [options],
  );
  const suggestions = useMemo(
    () => suggestIngredients(options, query, selected, SUGGESTION_LIMIT),
    [options, query, selected],
  );

  // Guard against the highlight pointing past a list that has since shrunk.
  const active = suggestions.length === 0 ? -1 : Math.min(highlight, suggestions.length - 1);

  function add(id: string): void {
    if (!selected.includes(id)) onChange([...selected, id]);
    setQuery('');
    setHighlight(0);
    setOpen(false);
    refocusing.current = true;
    inputRef.current?.focus();
    refocusing.current = false;
  }

  function remove(id: string): void {
    onChange(selected.filter((entry) => entry !== id));
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      if (suggestions.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setHighlight((current) => {
        const from = Math.min(current, suggestions.length - 1);
        return (from + step + suggestions.length) % suggestions.length;
      });
    } else if (event.key === 'Enter') {
      if (open && active !== -1) {
        event.preventDefault();
        add(suggestions[active].id);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    } else if (event.key === 'Backspace' && query === '' && selected.length > 0) {
      // Same shortcut as any tag field: backspace on an empty box drops the
      // last chip rather than doing nothing.
      remove(selected[selected.length - 1]);
    }
  }

  return (
    <div
      class="ingredient-filter"
      onFocusOut={(event) => {
        const next = event.relatedTarget as Node | null;
        if (!next || !event.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <label class="ingredient-filter__label" for={`${listId}-input`}>
        Search by ingredient
      </label>

      {selected.length > 0 && (
        <ul class="ingredient-chips" aria-label="Ingredients filtered on">
          {selected.map((id) => (
            <li key={id} class="ingredient-chip">
              {namesById[id] ?? id}
              <button
                type="button"
                class="ingredient-chip__remove"
                aria-label={`Remove ${namesById[id] ?? id} from the filter`}
                onClick={() => remove(id)}
              >
                ×
              </button>
            </li>
          ))}
          <li>
            <button type="button" class="ingredient-chips__clear" onClick={() => onChange([])}>
              Clear all
            </button>
          </li>
        </ul>
      )}

      <div class="ingredient-filter__field">
        <input
          id={`${listId}-input`}
          ref={inputRef}
          class="ingredient-filter__input"
          type="text"
          autocomplete="off"
          placeholder={selected.length > 0 ? 'Add another ingredient…' : 'e.g. chicken'}
          value={query}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && active !== -1 ? `${listId}-option-${active}` : undefined}
          onInput={(event) => {
            setQuery((event.currentTarget as HTMLInputElement).value);
            setHighlight(0);
            setOpen(true);
          }}
          onFocus={() => {
            if (!refocusing.current) setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />

        {open && (
          <ul class="ingredient-filter__list" id={listId} role="listbox">
            {suggestions.length === 0 ? (
              <li class="ingredient-filter__none">No ingredient matches “{query}”.</li>
            ) : (
              suggestions.map((option, index) => (
                <li key={option.id}>
                  <button
                    type="button"
                    id={`${listId}-option-${index}`}
                    class="ingredient-filter__option"
                    role="option"
                    aria-selected={index === active}
                    tabIndex={-1}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => add(option.id)}
                  >
                    {option.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
