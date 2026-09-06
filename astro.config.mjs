// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// --- GitHub Pages -----------------------------------------------------------
// Served from the custom domain recipes.matthewocallaghan.uk (see public/CNAME),
// so the site lives at the domain root and BASE is '/'. If you ever revert to
// the github.io project URL, set SITE to https://matthewocallaghan.github.io
// and BASE to '/recipe-app'.
const SITE = 'https://recipes.matthewocallaghan.uk';
const BASE = '/';
// ---------------------------------------------------------------------------

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  integrations: [preact()],
});
