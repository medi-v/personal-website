// Defines the "blog" content collection: which fields every post
// in src/content/blog/ must (or may) have in its frontmatter.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Every .md file in src/content/blog/ becomes one post
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    tags: z.array(z.string()).default([]),
    // Groups posts for the blog filter. Defaults to "AI & work";
    // set it to "Reflections" for personal essays.
    category: z.enum(['AI & work', 'Reflections']).default('AI & work'),
    // If set, the post card links out to this URL instead of a local page
    external_url: z.string().url().optional(),
    // Label shown on external posts, e.g. "LinkedIn" or "Medium"
    external_source: z.string().optional(),
  }),
});

// The "waves" collection: the curated pieces shown on /waves.
// One .md file per piece; the visible text lives in the frontmatter.
const waves = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/waves' }),
  schema: z.object({
    title: z.string(),
    // What kind of piece it is — shown as the small label, e.g.
    // "Essay", "Talk", "Speech", "Documentary", "Short film", "Film"
    kind: z.string(),
    // Author / source line, e.g. "Mark Manson" or "Ethan Hawke · TED"
    by: z.string(),
    // Link to the original piece. Optional: books have no link and are
    // shown as plain titles.
    url: z.string().url().optional(),
    // Which wave (section) it belongs to: 1–6 (see WAVE_META in waves.astro)
    wave: z.number().int().min(1).max(6),
    // Position inside its wave (1 = first)
    order: z.number(),
    // 2–3 line neutral summary of what the piece is about
    summary: z.string(),
  }),
});

export const collections = { blog, waves };
