# Sergey Völker — personal website

A small, fast personal site built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com). It introduces me and collects my
writing (native posts plus links to my Medium and LinkedIn articles).

## Run it locally

You need [Node.js](https://nodejs.org) installed. Then, in this folder:

```bash
npm install     # once, downloads the tools
npm run dev     # start a local preview at http://localhost:4321
```

`npm run build` creates the final static site in the `dist/` folder.

## Where the content lives

- **Blog posts:** `src/content/blog/` — one Markdown file per post. Copy an
  existing file to add a new one. The block between the `---` lines at the top
  sets the title, date, summary, tags, and category. Add `external_url` and
  `external_source` to make a post link out (e.g. to Medium) instead of opening
  on the site.
- **Home page text:** `src/pages/index.astro`
- **Colours and fonts:** `src/styles/global.css`
- **Shared links (LinkedIn, book):** `src/consts.ts`

## Deploying

The site is designed to be published for free on
[Cloudflare Pages](https://pages.cloudflare.com). Before going live, set your
real domain in `astro.config.mjs` (the `site` value) and in `public/robots.txt`.
