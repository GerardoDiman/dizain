import insforge from '@lib/insforge';
import { ProjectSchema, type Project } from '@schemas/project';
import { z } from 'zod';

/**
 * Fetch all published projects with their specs and images.
 * Data is validated with Zod before returning.
 */
/**
 * Fetch all published projects.
 * Deduplicates by slug, prioritizing the requested language.
 */
export async function getPublishedProjects(lang: string = 'es'): Promise<Project[]> {
  const { data, error } = await insforge.database
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[services/projects] Fetch error:', error.message);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  // Deduplicate by slug, prioritizing current lang
  const projectsBySlug = new Map<string, any>();
  
  // Sort data so that preferred lang comes last (overwriting others in the Map)
  // or just use logic to check if we already have the preferred lang.
  data.forEach((project: any) => {
    const existing = projectsBySlug.get(project.slug);
    if (!existing || project.lang === lang) {
      projectsBySlug.set(project.slug, project);
    }
  });

  const finalProjects = Array.from(projectsBySlug.values());
  const result = z.array(ProjectSchema).safeParse(finalProjects);

  if (!result.success) {
    console.error('[services/projects] Validation error:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Invalid project data from InsForge');
  }

  return result.data;
}

/**
 * Fetch a single project by slug.
 * Prioritizes the requested language, falls back to any available language.
 */
export async function getProjectBySlug(slug: string, lang: string = 'es'): Promise<Project> {
  const { data, error } = await insforge.database
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('slug', slug);

  if (error) {
    console.error(`[services/projects] DB Error for "${slug}":`, error.message);
    throw new Error(`Database error: ${error.message}`);
  }

  if (!data || data.length === 0) {
    throw new Error(`Project not found: ${slug}`);
  }

  // Find preferred lang
  const projectInLang = data.find((p: any) => p.lang === lang);
  const targetProject = projectInLang || data[0];

  const result = ProjectSchema.safeParse(targetProject);
  if (!result.success) {
    console.error(`[services/projects] Validation error for "${slug}":`, JSON.stringify(result.error.format(), null, 2));
    throw new Error(`Invalid project data for ${slug}`);
  }

  return result.data;
}
