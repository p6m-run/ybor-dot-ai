# Ybor website: project instructions

The ybor.ai marketing site, v1. It's a static site: hand-written HTML, CSS and vanilla JS in `site/`, no framework and no build step. The goal is to make it production-ready and replace the live ybor.ai.

## Who you're working with

Will is a designer, not a developer. Explain what you're doing in plain language, define technical terms the first time you use them, and give exact commands to run. Keep him moving: make sensible default choices, say what you chose, and ask only when the decision is really his.

## Structure

- `site/index.html` is Home. Each other page is its own `.html` file at the top level of `site/`.
- The header, mobile menu and footer are copied into every page. A nav or footer change has to be made in all 17 pages. Consider moving them into a shared include if you add a build step, but ask first.
- `site/styles/site.css` holds the design tokens (CSS variables) and all shared styles. Dark mode works through `[data-theme="dark"]` on `<html>`; the theme is chosen in an inline script at the top of each page.
- `site/js/site.js` runs menus, the theme toggle, copy buttons, the contact form and the `?intent=` prefill on Contact.
- Page-specific animations: `studio-flows.js` and `.css` (Studio UI demos), `modes.js` (the "three ways in" tabs on Platform), `delivery-explorer.js`.
- Icons come from `js/lucide.min.js`, which turns `<i data-lucide="name">` into SVGs.

## Conventions to keep

- **Hidden for v1:** anything not launching carries the class `hide-v1` (`display:none !important` in site.css). Don't delete hidden content; Will brings it back by removing the class. Hidden pages also carry `<meta name="robots" content="noindex">`.
- **Coming soon:** features that aren't generally available use `.soon-tag` / `.is-soon`. Today: customer deployments run on **Azure**; **AWS is coming soon**; GCP isn't offered. Don't claim AWS or GCP support.
- **No em dashes (—)** in site copy. Use commas, colons, periods or parentheses.
- **No colored left-border accents** on cards. When an accent bar is needed, draw it as an inset pseudo-element: 3px wide, 4px from the top, bottom and left edges, small radius. Never a border.
- **SOC 2 wording (AICPA rules):** "SOC 2®" with ® on first mention per page; use it as an adjective ("SOC 2 report", "SOC 2 Type 2 report"); write "Type 1" and "Type 2"; never "SOC 2 certified" or "SOC 2 compliant". The AICPA logo stays unaltered and links to https://www.aicpa.org/soc4so. Guidelines are in `docs/reference/`.
- **Copy and tone:** follow `docs/reference/ybor-tone-of-voice.md` for any new or edited text.
- Every page must work in light and dark mode. Check both after visual changes.

## The contact form

`#contactForm` in `contact.html` posts JSON to `/api/contact` (`api/contact.js`, a Vercel function). The function emails the submission to **salesinquiries@ybor.ai** through Resend, using `RESEND_API_KEY` from Vercel's environment settings. The recipient is fixed in the function, all visitor input is escaped, and form contents are never logged. The hidden `website` field is a honeypot: if it's filled in, the function returns success and sends nothing. If the request fails (or when previewing locally with the Python server), `site.js` falls back to opening the visitor's email app with a prefilled message.

## Hosting and motion

- `vercel.json` publishes only `site/`, turns on clean URLs, redirects the old site's pages, and sets security headers, including a Content Security Policy. Any new outside script or service has to be added to that policy.
- Looping animations must schedule their steps with `yborMotion.later()` / `yborMotion.clear()` (from `js/motion.js`) instead of `setTimeout`, so the header's "Pause animations" button can stop them (WCAG 2.2.2).

## Ybor rules (SOC 2 environment, not optional)

- Never hardcode, commit or print secrets, API keys or tokens. A public form-endpoint URL is fine; private keys go in the host's secret settings.
- The form collects names and work emails (personal data). Only send it to a vendor approved in Secureframe, and never paste form submissions into tickets, logs or public places.
- Changes reach production through pull requests only, with no direct pushes to the main branch. Branches are named `{TICKET}/description-with-dashes`, and commits and PR titles start with the Jira key (for example `YP6M-1234: ...`). Ask Will for the ticket key.
- Never say a check, test or build passed unless you actually ran it and saw the result.
- Before pushing or opening a PR, run the `ybor-standards:pre-push-review` skill on the diff if it's available.

## Start here

Read `LAUNCH-CHECKLIST.md`. It lists what's left before launch, in order.
