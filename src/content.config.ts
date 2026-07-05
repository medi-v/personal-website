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

export const collections = { blog };
