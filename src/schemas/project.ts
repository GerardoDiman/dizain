import { z } from 'zod';

// Helper for translatable fields
const TranslationSchema = z.record(z.string()).or(z.string()); 
// We keep string as fallback during transition, but target is Record<string, string>

export const ProjectSpecSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  label: TranslationSchema,
  value: TranslationSchema,
  sort_order: z.number().int(),
});

export const ProjectImageSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  image_url: z.string().url(),
  alt_text: z.string().min(1).optional().default('Project image'),
  caption: z.string().nullable().optional(),
  sort_order: z.number().int(),
});

export const ProjectSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: TranslationSchema,
  subtitle: TranslationSchema.nullable(),
  description: TranslationSchema,
  workbench: TranslationSchema.nullable(),
  software: TranslationSchema,
  thumbnail_url: z.string().url().nullable().optional(),
  hero_image_url: z.string().url().nullable().optional(),
  sort_order: z.number().int(),
  is_published: z.boolean(),
  model_url: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  project_specs: z.array(ProjectSpecSchema).optional(),
  project_images: z.array(ProjectImageSchema).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;
export type ProjectImage = z.infer<typeof ProjectImageSchema>;
