# SPEC — Personal Website for Sergey Völker

Purpose: introduce Sergey to recruiters (first) and potential clients (second).
A portfolio of proof — expertise and credibility. No selling, no services, no pricing.

## Decisions already made (from your answers)

- **Domain:** none yet. Site is built with a placeholder URL (`https://example.pages.dev`)
  in one config line — swapped for the real domain later in 10 seconds.
- **Tone:** personal and direct. First person, plain language, no corporate buzzwords.
- **Photo:** yes — layout has a headshot slot with a placeholder image until you provide one.
- **Contact:** "Connect on LinkedIn" button only. No email on the site.
- **Name:** full name "Sergey Völker", as on the CV and LinkedIn. (Say so if you'd
  rather have "Sergey V.")
- **Language:** site is in English.

## Pages

Just two views plus feeds — deliberately small:

1. **Home (`/`)** — one long, well-paced page:
   - **Hero:** name, one-line positioning ("AI Enablement & Program Manager…"),
     2–3 sentence intro, headshot, LinkedIn button.
   - **The book** (lead proof): *Introduction to AI Implementation for Managers*
     (Apress / Springer Nature, co-authored with Oscar Garcia), your verbatim
     description, pre-order link to Amazon.
   - **Selected work** (proof section): short entries with outbound links —
     Plandek case study, Driver.ai case study, Cursor workshop, AI Summer School.
   - **Highlights:** 5–6 scannable milestones from the CV (agentic AI rollout across
     150+ developers, ~50% cycle-time reduction across 20+ teams, post-M&A
     integration of 3 teams / 40+ experts, DB Netz quality network of 60+ members,
     AI Summer School with 200+ daily participants).
   - **Background:** one compact block — 10+ years Deutsche Bahn → LucaNet,
     engineering + business psychology degrees, key certifications (PRINCE2,
     PSM II, PSPO I, Microsoft AI Transformation Leader, Certified Agile
     Transformation Manager). Prose, not a CV dump.
   - **Writing:** the 3 latest blog entries, then the footer with the LinkedIn button.

2. **Blog (`/blog`)** — a clean list of entries.
   - **Native posts** open on your site at `/blog/post-name`.
   - **External posts** (Medium, LinkedIn…) link straight out and carry a small
     label like "LinkedIn ↗" so readers know they're leaving.

3. **Feeds:** RSS at `/rss.xml`, sitemap at `/sitemap-index.xml`. Nothing else.

## Blog content model

Each post is one Markdown file in `src/content/blog/`. Frontmatter fields:

| Field             | Required | Meaning                                          |
|-------------------|----------|--------------------------------------------------|
| `title`           | yes      | Post title                                       |
| `date`            | yes      | Publication date                                 |
| `summary`         | yes      | 1–2 sentences shown on the card                  |
| `tags`            | no       | e.g. `["AI adoption", "leadership"]`             |
| `external_url`    | no       | If set, the card links here instead of a local page |
| `external_source` | no       | Label for external items, e.g. `"LinkedIn"`      |

Seed content (3 entries):
1. **Native placeholder post** — real structure, clearly-marked placeholder text.
2. **External:** Cursor workshop LinkedIn post (real link).
3. **External:** LucaNet AI Summer School LinkedIn post (real link).

## Design tokens (please confirm)

- **Typefaces** (self-hosted, no Google-Fonts tracking):
  - *Newsreader* — an elegant editorial serif for headings **and** body text.
    Gives the "essay, not brochure" feel of the reference sites.
  - System sans (what your device already has) for small UI text: nav, dates,
    tags, buttons. Zero extra weight, crisp at small sizes.
- **Colors** (warm paper, near-black ink, one accent — Anthropic-like):
  - Background `#FAF9F7` (warm off-white) · Text `#1A1917` (soft near-black)
  - Muted text `#6E6A63` · Hairlines/borders `#E5E2DC`
  - Accent `#C15F3C` (muted clay/rust) — links, the LinkedIn button, small labels.
    Used sparingly; everything else stays monochrome.
- **Type scale:** ~17–18px body, generous line height (1.7); headings step up
  1.25× per level; hero name is the only very large element.
- **Spacing:** one narrow reading column (~68 characters wide), big vertical
  gaps between sections, lots of whitespace. Mobile-first.
- **Motion:** one subtle staged fade-up on page load. Nothing else moves.
- No dark mode, no theme toggle — one committed look.

## Technical

- Astro 5 + Tailwind CSS 4, blog via Astro content collections.
- Integrations: `@astrojs/rss`, `@astrojs/sitemap` — no others.
- Semantic HTML, alt texts, visible focus states, proper heading order.
- Static output, ready for Cloudflare Pages (free tier).

## Out of scope (not built)

Services/"hire me" page, pricing, booking, payments, analytics, tracking,
cookies, CMS, dark mode, search, comments, newsletter.

## Known placeholders (to fill later)

1. Real domain (one line in `astro.config.mjs` + one in `public/robots.txt`).
2. Native blog post: real text from you
   (`src/content/blog/rolling-out-agentic-ai.md`).
3. Further LinkedIn posts: LinkedIn blocks automated reading, so paste the
   URLs of posts you want listed and they'll be added as external entries.

**Note:** your CV lists the book as "AI Adoption for Organizations (Apress,
forthcoming 2026)" but the Amazon page says "Introduction to AI Implementation
for Managers". I use the Amazon title on the site.

## How to run it locally

```
npm install     (once)
npm run dev     → open http://localhost:4321
```
