// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// --- GitHub Pages -----------------------------------------------------------
// TODO: replace YOUR-GITHUB-USERNAME with your account, and make sure BASE
// matches the repository name exactly (leading slash, no trailing slash).
// Deploying to a root domain instead? Set BASE to '' and drop the base option.
const SITE = 'https://YOUR-GITHUB-USERNAME.github.io';
const BASE = '/recipe-app';
// ---------------------------------------------------------------------------

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  integrations: [preact()],
});
