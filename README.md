# Matthew's recipes

A personal static site for browsing recipes and working out ingredient
quantities. Pick recipes, set portions on each, and get one combined shopping
list with shared ingredients added together.

Built with [Astro](https://astro.build) (static output) and Preact islands. The
design follows the "Matthew's recipes" Claude Design prototype.

## Getting started

```bash
npm install
npm run dev        # http://localhost:4321/recipe-app/
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Validate data, then build to `dist/` |
| `npm run preview` | Serve the built site |
| `npm test` | Unit tests for the scaling and shopping-list logic |
| `npm run check` | Type-check Astro, TypeScript and Preact files |
| `npm run validate` | Check the data files on their own |
| `npm run add:ingredient` | Add an ingredient |
| `npm run add:recipe` | Scaffold a recipe stub |

## The data

Everything lives in two JSON files, structured like database tables. Recipes
reference ingredients by id, so an ingredient used in five recipes is stored
once.

- `src/data/ingredients.json` — the shared ingredient table
- `src/data/recipes.json` — recipes, referencing ingredients by id

Both ship empty. Ids are readable slugs (`chicken-breast`) and must be unique;
a recipe's id is also its URL.

### Adding an ingredient

```bash
npm run add:ingredient -- "Chicken breast" --unit g
npm run add:ingredient -- "Onion" --unit ""
```

`--unit ""` marks something counted rather than measured, so it shows as
"2 onions" instead of "2g onion". The script derives the id, refuses duplicates
and keeps the file sorted by name.

### Adding a recipe

```bash
npm run add:recipe -- "Beef Enchiladas" --type Main --servings 4 --prep 15 --cook 25
```

That writes a stub you then fill in:

```json
{
  "id": "beef-enchiladas",
  "name": "Beef Enchiladas",
  "mealType": "Main",
  "baseServings": 4,
  "prepMins": 15,
  "cookMins": 25,
  "freezerLifeMonths": 3,
  "image": null,
  "ingredients": [
    { "ingredientId": "beef-mince", "qty": 500, "unit": "g" },
    { "ingredientId": "onion", "qty": 1, "unit": "", "prep": "diced" }
  ],
  "method": ["Fry the onion.", "Brown the mince."],
  "cooking": {
    "standard": ["Bake uncovered at 190C for 20 minutes."],
    "fromFrozen": ["Cover with foil and bake at 180C for 50 minutes."]
  }
}
```

Field notes:

- **`mealType`** — `Main`, `Side` or `Dessert`. The Recipes page shows filter
  pills once more than one type exists.
- **`baseServings`** — how many portions the quantities above make. Everything
  scales from this.
- **`qty` / `unit`** — `g`, `ml`, `kg`, `l` render flush (`600g`); anything else
  gets a space (`2 tbsp`); `""` gives a bare count (`3`).
- **`prep`** — optional, per recipe. Shows on the recipe as "Onion, diced" but
  is dropped from the shopping list, since you buy onions, not diced onions.
- **`freezerLifeMonths`** — `null` for a dish that does not freeze; the ❄ line
  is then hidden.
- **`cooking.standard`** — required. Covers cooking now and cooking from
  defrosted, which are the same job once the dish is at fridge temperature.
- **`cooking.fromFrozen`** — optional. Leave it out for a recipe that cannot be
  cooked from frozen and the tab disappears; the standard steps still show.
- **`image`** — a filename in `public/images/recipes/`, or `null` for the
  striped placeholder.

Run `npm run validate` after editing by hand. It fails the build on unknown
ingredient references and duplicate ids, and warns about half-finished recipes
and unused ingredients.

## Nutrition

Not filled in yet, but the code is ready. Every ingredient has a `nutrition`
field set to `null`. Populate it with figures per 100g/100ml (or per item for
counted ingredients):

```json
{
  "id": "chicken-breast",
  "name": "Chicken breast",
  "defaultUnit": "g",
  "nutrition": { "basis": 100, "unit": "g", "kcal": 165, "protein": 31, "carbs": 0, "fat": 3.6 }
}
```

A recipe's per-portion panel appears automatically once *every* ingredient it
uses has figures — a partial total would be misleading, so until then the
section stays hidden. No code changes needed.

## How it fits together

```
src/
├── data/            the two JSON tables
├── content.config.ts  Zod schemas — the data contract, enforced at build time
├── lib/             scaling, unit formatting, shopping-list aggregation, state
├── components/      .astro for static markup, .tsx for interactive islands
└── pages/           / (recipes), /recipes/[id], /plan
```

Portions and plan selections live in `localStorage` via nanostores, which is
what lets them survive navigating between pages.

## Deploying

Pushing to `main` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`. Setup:

1. In the repository settings, set Pages → Build and deployment → Source to
   **GitHub Actions**.
2. The site is served from the custom domain `recipes.matthewocallaghan.uk`:
   - `public/CNAME` holds the domain so each deploy keeps it.
   - `astro.config.mjs` sets `SITE` to `https://recipes.matthewocallaghan.uk`
     and `BASE` to `/`.
   - DNS: a `CNAME` record for `recipes` → `matthewocallaghan.github.io`.
   - In Pages settings, set Custom domain to `recipes.matthewocallaghan.uk` and
     enable **Enforce HTTPS** once the certificate is issued.
