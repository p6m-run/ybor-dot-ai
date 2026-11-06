# Ybor website (v1)

The new ybor.ai marketing site, exported from the "Ybor Website v.01" prototype on 4 Nov 2026. It's ready to open in Claude Code and turn into the real site.

## What's in this folder

| Folder or file | What it is |
|---|---|
| `site/` | The website. Everything here is what gets published. |
| `site/*.html` | One file per page (Home is `index.html`). |
| `site/styles/site.css` | The shared look: colors, type, layout, dark mode. |
| `site/js/site.js` | Shared behavior: menus, theme switch, contact form. |
| `site/assets/` | Logos, photos, the SOC 2 logo, and the product video. |
| `site/fonts/` | Manrope and JetBrains Mono, served from the site itself. |
| `site/robots.txt`, `site/sitemap.xml` | Tell search engines what to index. |
| `site/404.html` | The "page not found" page. |
| `site/favicon.ico`, `site/favicon.svg`, `site/apple-touch-icon.png` | Browser-tab icon, and the icon iPhones and message apps show (white Ybor mark on brand purple). |
| `site/assets/og/ybor-og.jpg` | The 1200×630 image shown when a ybor.ai link is shared. |
| `site/.well-known/security.txt` | Tells security researchers how to report a problem. Renew the `Expires` date before October 2027. |
| `site/js/motion.js` | The "Pause animations" button's shared logic. |
| `api/contact.js` | The contact form's server code. Runs on Vercel and emails salesinquiries@ybor.ai through Resend. |
| `vercel.json` | Hosting settings: publish only `site/`, clean addresses, redirects from the old site, security headers. |
| `docs/source-assets/` | Full-size originals of images that were shrunk for the web. Not published. |
| `CLAUDE.md` | Instructions Claude Code reads automatically when you open the folder. |
| `LAUNCH-CHECKLIST.md` | What still has to happen before ybor.ai can switch over. |
| `docs/reference/` | The AICPA SOC logo and communications guidelines, plus the Ybor tone-of-voice guide. |

The site is plain HTML, CSS and JavaScript. There's no build step, framework, or install. The one piece of server code is the contact form function in `api/`.

## See it on your computer

1. Unzip this folder somewhere easy, like your Desktop.
2. Open Terminal and go into the `site` folder:
   ```
   cd ~/Desktop/ybor-website/site
   ```
3. Start a small local web server (Python comes with macOS):
   ```
   python3 -m http.server 8080
   ```
4. Open http://localhost:8080 in your browser.
5. To stop the server, go back to Terminal and press Ctrl + C.

Double-clicking an `.html` file mostly works too, but the video and a few scripts behave better through the local server.

## Hand it to Claude Code

1. Open Terminal in the `ybor-website` folder (the one with this README) and run `claude`.
2. Claude Code reads `CLAUDE.md` first, so it already knows the project's rules.
3. A good first message: *"Read LAUNCH-CHECKLIST.md and help me work through the engineering items, starting with the contact form."*

## Hidden for v1

Some content is switched off for launch but kept in the code so it's easy to bring back: Resources, Blog, Customers, the Integrations footer link, "View docs", the old pricing tiers, open roles, "How we hire", and "The package". Everything hidden carries the `hide-v1` class. Remove that class to show it again. The hidden pages (Blog, the three blog posts, Customers, Ashley case study) also carry a `noindex` tag so search engines skip them; remove it when each page goes live.

## Hosting (Vercel)

The site deploys to Vercel, replacing the old Astro site in the `p6m-run/ybor-dot-ai` repo. `vercel.json` does the setup:

- **Publishes only `site/`.** `docs/`, `CLAUDE.md` and the rest stay out of the website. They're still visible in the repo, though, because it's public.
- **Clean addresses.** `/platform` serves `platform.html`, and `/platform.html` redirects to `/platform`. Links inside the pages still end in `.html`, so the local preview keeps working.
- **Redirects** send every page of the old site to its new home (for example `/culture-and-careers` goes to `/careers`).
- **Security headers:** HTTPS only, a Content Security Policy, and no framing.

In the Vercel project settings, set **Framework Preset** to **Other** (it's Astro today), and make sure `RESEND_API_KEY` is set as an environment variable. Never put the key in a file.

**The contact form** posts to `/api/contact`. That function emails the submission to salesinquiries@ybor.ai from no-reply@ybor.ai through Resend. The local Python server can't run it, so locally the form falls back to opening your email app. To test it for real, use a Vercel preview link.

**If you add analytics or any outside script,** add its domain to the `Content-Security-Policy` header in `vercel.json`, or the browser will block it.
