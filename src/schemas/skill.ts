import { z } from 'zod';

export const SkillCategoryEnum = z.enum([
  'software',
  'education',
  'languages',
  'design',
]);

export const SkillSchema = z.object({
  id: z.string().uuid(),
  category: SkillCategoryEnum,
  label: z.string().min(1),
  sort_order: z.number().int(),
  created_at: z.string(),
});

export type Skill = z.infer<typeof SkillSchema>;
export type SkillCategory = z.infer<typeof SkillCategoryEnum>;
