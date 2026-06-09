import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const baseSchema = z.object({
  title: z.string(),
  description: z.string().default(''),
  /** Optionaler Lead-/Intro-Satz unter der Überschrift */
  lead: z.string().optional(),
  /** Reihenfolge (z.B. Leistungs-Grid) */
  order: z.number().optional(),
  /** Icon-Key (Leistungen) */
  icon: z.string().optional(),
});

const leistungen = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leistungen' }),
  schema: baseSchema,
});

const seiten = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/seiten' }),
  schema: baseSchema,
});

export const collections = { leistungen, seiten };
