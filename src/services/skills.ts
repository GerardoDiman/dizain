import insforge from '@lib/insforge';
import { SkillSchema, type Skill, type SkillCategory } from '@schemas/skill';
import { z } from 'zod';

/**
 * Fetch all skills, sorted by category and sort_order.
 */
export async function getAllSkills(): Promise<Skill[]> {
  const { data, error } = await insforge.database
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[services/skills] Fetch error:', error.message);
    return [];
  }

  const result = z.array(SkillSchema).safeParse(data);

  if (!result.success) {
    console.error('[services/skills] Validation error:', result.error.format());
    return [];
  }

  return result.data;
}

/**
 * Group skills by category for rendering the Skills Matrix.
 */
export async function getSkillsByCategory(): Promise<Record<SkillCategory, Skill[]>> {
  const skills = await getAllSkills();

  const grouped: Record<SkillCategory, Skill[]> = {
    software: [],
    education: [],
    languages: [],
    design: [],
  };

  for (const skill of skills) {
    grouped[skill.category].push(skill);
  }

  return grouped;
}
