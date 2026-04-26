import { supabase } from '@lib/supabase';
import { ProjectSchema, type Project } from '@schemas/project';
import { z } from 'zod';

// Helper to extract translation
const translate = (field: any, lang: string) => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field['es'] || Object.values(field)[0] || '';
};

/**
 * Fetch all published projects.
 */
export async function getPublishedProjects(lang: string = 'es'): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[services/projects] Fetch error:', error.message);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  const translatedData = data.map((p: any) => ({
    ...p,
    title: translate(p.title, lang),
    subtitle: translate(p.subtitle, lang),
    description: translate(p.description, lang),
    workbench: translate(p.workbench, lang),
    software: translate(p.software, lang),
    project_specs: p.project_specs?.map((s: any) => ({
      ...s,
      label: translate(s.label, lang),
      value: translate(s.value, lang)
    }))
  }));

  const result = z.array(ProjectSchema).safeParse(translatedData);

  if (!result.success) {
    console.error('[services/projects] Validation error:', JSON.stringify(result.error.format(), null, 2));
    return translatedData as Project[]; // Fallback to raw data if validation fails but we need to show something
  }

  return result.data;
}

/**
 * Fetch a single project by slug.
 */
export async function getProjectBySlug(slug: string, lang: string = 'es'): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`[services/projects] DB Error for "${slug}":`, error.message);
    throw new Error(`Database error: ${error.message}`);
  }

  const translatedProject = {
    ...data,
    title: translate(data.title, lang),
    subtitle: translate(data.subtitle, lang),
    description: translate(data.description, lang),
    workbench: translate(data.workbench, lang),
    software: translate(data.software, lang),
    project_specs: data.project_specs?.map((s: any) => ({
      ...s,
      label: translate(s.label, lang),
      value: translate(s.value, lang)
    }))
  };

  const result = ProjectSchema.safeParse(translatedProject);
  if (!result.success) {
    console.error(`[services/projects] Validation error for "${slug}":`, JSON.stringify(result.error.format(), null, 2));
    return translatedProject as Project;
  }

  return result.data;
}

