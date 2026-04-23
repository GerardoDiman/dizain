import { z } from 'zod';

export const ProjectSpecSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  label: z.string().min(1),
  value: z.string().min(1),
  sort_order: z.number().int(),
});

export const ProjectImageSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  image_url: z.string().url(),
  alt_text: z.string().min(1),
  caption: z.string().nullable(),
  sort_order: z.number().int(),
});

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().nullable(),
  description: z.string().min(1),
  workbench: z.string().nullable(),
  software: z.string().min(1),
  thumbnail_url: z.string().url().nullable(),
  hero_image_url: z.string().url().nullable(),
  sort_order: z.number().int(),
  is_published: z.boolean(),
  model_url: z.string().url().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  project_specs: z.array(ProjectSpecSchema).optional(),
  project_images: z.array(ProjectImageSchema).optional(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectSpec = z.infer<typeof ProjectSpecSchema>;
export type ProjectImage = z.infer<typeof ProjectImageSchema>;
