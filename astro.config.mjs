// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// --- GitHub Pages -----------------------------------------------------------
// Deployed from MatthewOCallaghan/recipe-app, so the site lives at
// https://matthewocallaghan.github.io/recipe-app and BASE must match the
// repository name. Renaming the repo means changing BASE to match.
const SITE = 'https://matthewocallaghan.github.io';
const BASE = '/recipe-app';
// ---------------------------------------------------------------------------

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  integrations: [preact()],
});
