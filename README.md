# Sergey Völker — personal website

A small, fast, static personal site built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com). It introduces me and collects my
writing (native posts plus links to my Medium and LinkedIn articles).

## Run it locally

You need [Node.js](https://nodejs.org) (version 20.3+; this project is pinned to
Node 22 via `.nvmrc`). Then, in this folder:

```bash
npm install     # once, downloads the tools
npm run dev     # start a local preview at http://localhost:4321
```

`npm run build` creates the final static site in the `dist/` folder.

## Where the content lives

- **Blog posts:** `src/content/blog/` — one Markdown file per post.
- **Home page text:** `src/pages/index.astro`
- **Colours and fonts:** `src/styles/global.css`
- **Shared links (LinkedIn, book):** `src/consts.ts`

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

## License

The **source code** is MIT-licensed (see `LICENSE`). The **written content**
(blog posts, book description, biographical text, images, name) is
© 2026 Sergey Völker, all rights reserved — please don't reuse it.
