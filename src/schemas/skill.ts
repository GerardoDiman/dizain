import { z } from 'zod';

const TranslationSchema = z.record(z.string()).or(z.string());

export const SkillCategoryEnum = z.enum([
  'software',
  'education',
  'languages',
  'design',
]);

export const SkillSchema = z.object({
  id: z.string().uuid().optional(),
  category: SkillCategoryEnum,
  label: TranslationSchema,
  sort_order: z.number().int(),
  created_at: z.string().optional(),
});

export type Skill = z.infer<typeof SkillSchema>;
export type SkillCategory = z.infer<typeof SkillCategoryEnum>;
