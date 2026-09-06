/**
 * Build a URL that respects the configured `base` path, which is non-empty when
 * the site is served from a GitHub Pages project subdirectory. Every internal
 * link goes through this so the site works both locally and when deployed.
 */
export function href(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  const rest = path.replace(/^\/+/, '');
  return rest ? `${base}/${rest}` : `${base}/`;
}

export function recipeHref(id: string): string {
  return href(`/recipes/${id}`);
}
