# Ybor.ai Marketing Site

The Ybor.ai marketing website, built with [Astro](https://astro.build/). Static output,
no client framework — just Astro components, a shared design-system stylesheet, and a small
vanilla-JS interaction layer.

## Getting started

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # static build to dist/
npm run preview    # serve the built dist/ locally
```

Node 18+ recommended (developed on Node 24).

## Project structure

```
src/
  layouts/
    Base.astro          # <head>, theme script, header/footer chrome, named slots
  components/
    Header.astro        # primary nav + dropdowns (accepts `active` prop)
    MobileMenu.astro     # mobile nav drawer
    Footer.astro         # footer columns, newsletter, legal bar
  pages/                 # one .astro file per route (index, about, pricing, …)
  styles/
    site.css             # the full Ybor design system (tokens, components)
public/
  assets/                # images and logos
  fonts/                 # Manrope + JetBrains Mono (self-hosted)
  js/
    site.js              # shared interactions (theme, nav, tabs, forms, reveals)
    lucide.min.js        # vendored Lucide icon library (no CDN)
design-reference/        # original HTML/CSS/JS prototypes (Claude Design handoff)
```

## Pages

`/` · `/about` · `/ashley-furniture` · `/blog` · `/blog-crossplane` · `/careers` ·
`/contact` · `/customers` · `/how-it-works` · `/pricing` · `/privacy` · `/security` ·
`/terms` · `/trust-center` · `/y-app` · `/y-infra`

## Notes

- **Design system** — `src/styles/site.css` holds all tokens and component styles, ported
  verbatim from the design handoff. Page-specific CSS lives in each page's `<style slot="head">`.
- **Icons** — [Lucide](https://lucide.dev/) is vendored at `public/js/lucide.min.js` and
  initialized by `site.js`; markup uses `<i data-lucide="…">`. The site loads no external hosts.
- **Theme** — light/dark is set before first paint by an inline script in `Base.astro` and
  persisted to `localStorage` (`ybor-theme`); a toggle is injected into the header by `site.js`.
- **design-reference/** — the original prototypes, kept for visual reference. Excluded from the
  Astro build; not part of the shipped site.
