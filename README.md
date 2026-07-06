# Sergey Völker — personal website

[![CI](https://github.com/medi-v/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/medi-v/personal-website/actions/workflows/ci.yml)

A small, fast, static personal site built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com). It introduces me and collects my
writing (native posts plus links to my Medium and LinkedIn articles).

## How this site works

I'm a program manager, not a developer by trade — so I built this deliberately
simple and safe rather than clever. A few decisions are worth calling out,
because they're the reason the site is cheap to run, hard to break, and safe to
open-source.

**Static by design — nothing to attack.** Astro turns the whole site into plain
HTML, CSS, and JavaScript files at build time. There is no server running the
site, no database, and no logins or forms that submit anywhere. That removes
entire categories of risk at the source: there is simply nothing there to hack.
Cloudflare Pages serves the finished files from its global network, so pages
load fast and hosting is free.

**Security that doesn't depend on secrecy.** The site is designed to stay safe
even though every line of it is public. A strict [Content Security Policy](public/_headers)
tells the browser to run *no inline scripts at all* — so even if some bad text
ever slipped onto a page, the browser wouldn't execute it. The little bits of
JavaScript the site does use (the blog filter, the animation on `/waves`) each
live as their own file in `public/`, which keeps that policy strict. On top of
that come the usual protective headers (HSTS, `X-Frame-Options`, COOP,
`X-Content-Type-Options`), all defined in one readable [`public/_headers`](public/_headers)
file.

**Private details never touch the code.** German law requires a legal notice
(*Impressum*) showing a real address and email — exactly the kind of thing you
don't want sitting in a public repository. The [Impressum page](src/pages/impressum.astro)
reads those values from environment variables at build time: the real ones live
in a git-ignored `.env` file locally and in the Cloudflare dashboard in
production. If they're missing, the page shows clearly-marked `[placeholders]`
instead. So the source is safe to publish, while the live page still shows what
the law requires.

**Guardrails so a mistake can't quietly ship.** Every push runs a
[GitHub Actions workflow](.github/workflows/ci.yml) that rebuilds the site — if a
blog post has broken formatting or a link between pages is wrong, the build fails
there, before it can reach visitors. It also checks internal links and runs with
read-only permissions (least privilege). [Dependabot](.github/dependabot.yml)
watches the project's dependencies and opens a pull request when a security
update is available. The [pre-deployment checklist](#pre-deployment-checklist)
below is the human half of the same idea.

**Fast and private for readers.** Fonts are self-hosted (no Google Fonts, no
third-party tracking), images are kept small, and JavaScript loads only on the
pages that actually use it. Analytics, where used, are cookieless.

If you want the deeper reasoning behind any of this, the code is heavily
commented — each file explains *why* it's built the way it is, not just what it
does.

## Run it locally

You need [Node.js](https://nodejs.org) (version 22.12+; this project is pinned to
Node 22 via `.nvmrc`). Then, in this folder:

```bash
npm install     # once, downloads the tools
npm run dev     # start a local preview at http://localhost:4321
```

`npm run build` creates the final static site in the `dist/` folder.

## Where the content lives

- **Blog posts:** `src/content/blog/` — one Markdown file per post.
- **Waves (curated collection):** `src/content/waves/` — one Markdown file per piece.
- **Home page text:** `src/pages/index.astro`
- **Colours and fonts:** `src/styles/global.css`
- **Shared links (LinkedIn, book):** `src/consts.ts`

### Adding a piece to the Waves page

Each curated essay/talk/film on `/waves` is a small Markdown file in
`src/content/waves/`. Copy an existing file and adjust the frontmatter:

```markdown
---
title: "Name of the piece"
kind: "Essay"            # or Talk, Speech, Documentary, Short film, Film …
by: "Author · Source"    # e.g. "Ethan Hawke · TED"
url: "https://…"         # link to the original
wave: 2                  # section: 1 Attention, 2 Creativity,
                         # 3 Wanting less, 4 Becoming
order: 8                 # position inside its wave (1 = first)
summary: "Two or three neutral lines about what the piece is about."
---
```

The section names, intros and quotes live in `WAVE_META` at the top of
`src/pages/waves.astro`. To add a fifth wave: add an entry there **and** raise
the `wave` maximum in `src/content.config.ts`.

### Adding or editing a blog post

Each post is a Markdown file in `src/content/blog/`. The block between the `---`
lines at the top (the "frontmatter") controls how it shows up. Copy an existing
file to start a new one.

```markdown
---
title: "My post title"
date: 2026-07-05
summary: "One or two sentences shown on the card."
tags: ["AI", "leadership"]
category: "AI & work"      # or "Reflections" — controls the blog filter
# external_url: "https://…"   # if present, the card links OUT instead of
# external_source: "Medium"   # opening a page on this site (label shown on the card)
---

Body text goes here (only used for on-site posts, i.e. when there is no
external_url).
```

- Leave out `external_url` to publish the post **on the site** at `/blog/<filename>`.
- Add `external_url` + `external_source` to make the card **link out** (Medium, LinkedIn…).
- `category` must be either `"AI & work"` or `"Reflections"` (drives the filter on `/blog`).

If the frontmatter is malformed, `npm run build` will fail with a clear message —
that's the safety net, so always run a build before publishing.

## Deploying to Cloudflare Pages (free)

1. Push to GitHub (this repo).
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**,
   then pick this repository. (For a **private** repo, grant Cloudflare access to it
   when prompted.)
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Environment variable:** `NODE_VERSION = 22`
4. Deploy. Cloudflare gives you a free `*.pages.dev` URL immediately.
5. **Custom domain:** once you own `sergeyvoelker.com`, add it under the project's
   **Custom domains** tab and follow the DNS steps. The domain is already set in
   `astro.config.mjs` (`site`) and `public/robots.txt`.

Security headers and caching rules are defined in `public/_headers`.

## Pre-deployment checklist

Run through this before every push to `main` (pushing deploys the live site):

1. **Build passes:** `npm run build` — catches broken frontmatter, bad links
   between pages, and type errors. Never push if the build fails.
2. **Security:**
   - No inline `<script>` anywhere (the CSP in `public/_headers` blocks them —
     use normal Astro `<script>` tags, which are bundled into external files).
   - External links use `target="_blank" rel="noopener"`.
   - No secrets, API keys, or personal data in the repo.
   - New third-party resources (fonts, scripts, images from other domains)
     require a deliberate CSP change in `public/_headers` — avoid if possible.
3. **SEO:** every new page needs a unique `<title>` and `description` (passed
   to the `Base` layout). The sitemap (`@astrojs/sitemap`) and canonical URLs
   update automatically at build time — but confirm the new page appears in
   `dist/sitemap-*.xml` after the build.
4. **Accessibility & health:** keyboard focus visible, images have `alt`,
   animations respect `prefers-reduced-motion` where feasible (deliberate
   exception: the decorative water/birds on `/waves` — Windows often sets
   that flag system-wide and would freeze the page), page works on a
   narrow (mobile) window.
5. **Manual test:** `npm run preview` after the build, click through the
   changed pages once — including one blog post and the 404 page.

## After deploying (1 minute)

1. Open the changed pages once on the live site.
2. If headers or files in `public/` changed, confirm they actually arrived,
   e.g. `curl -I https://sergeyvoelker.com/` for headers.
3. CI on GitHub should be green. Note: Cloudflare deploys on every push to
   `main` **even if CI fails** — a red CI still needs a follow-up fix.
4. If a dashboard setting changed (Cloudflare, GitHub), verify the *result*
   on the live site — a saved setting is not proof it works.

## Maintenance rhythm

- **Weekly:** review Dependabot PRs. Routine bumps (GitHub Actions) can be
  merged when CI is green; framework major upgrades get tested on a branch
  first (build + preview + spot checks). Never merge a bot PR without
  reading its diff — bots sometimes propose architecture changes.
- **Monthly:** run `npm audit`; click through the live site once.
- **Yearly:** renew the `Expires:` date in
  `public/.well-known/security.txt` (currently set to July 2027).

## License

The **source code** is MIT-licensed (see `LICENSE`). The **written content**
(blog posts, book description, biographical text, images, name) is
© 2026 Sergey Völker, all rights reserved — please don't reuse it
(see `NOTICE`).
