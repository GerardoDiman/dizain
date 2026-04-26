import { supabase } from '@lib/supabase';
import { SkillSchema, type Skill, type SkillCategory } from '@schemas/skill';
import { z } from 'zod';

/**
 * Fetch all skills, sorted by category and sort_order.
 */
export async function getAllSkills(lang: string = 'es'): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[services/skills] Fetch error:', error.message);
    return [];
  }

  // Helper to extract translation
  const translate = (field: any, l: string) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[l] || field['es'] || Object.values(field)[0] || '';
  };

  const translatedData = data.map((s: any) => ({
    ...s,
    label: translate(s.label, lang)
  }));

  const result = z.array(SkillSchema).safeParse(translatedData);

  if (!result.success) {
    console.error('[services/skills] Validation error:', JSON.stringify(result.error.format(), null, 2));
    return translatedData as Skill[];
  }

  return result.data;
}

/**
 * Group skills by category for rendering the Skills Matrix.
 */
export async function getSkillsByCategory(lang: string = 'es'): Promise<Record<SkillCategory, Skill[]>> {
  const skills = await getAllSkills(lang);

  const grouped: Record<SkillCategory, Skill[]> = {
    software: [],
    education: [],
    languages: [],
    design: [],
  };

  for (const skill of skills) {
    const cat = skill.category as SkillCategory;
    if (grouped[cat]) {
      grouped[cat].push(skill);
    }
  }

  return grouped;
}

