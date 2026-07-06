# Sergey Völker — personal website

[![CI](https://github.com/medi-v/personal-website/actions/workflows/ci.yml/badge.svg)](https://github.com/medi-v/personal-website/actions/workflows/ci.yml)

A small, fast, static personal site built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com). It introduces me and collects my
writing (native posts plus links to my Medium and LinkedIn articles).

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

## License

The **source code** is MIT-licensed (see `LICENSE`). The **written content**
(blog posts, book description, biographical text, images, name) is
© 2026 Sergey Völker, all rights reserved — please don't reuse it
(see `NOTICE`).
