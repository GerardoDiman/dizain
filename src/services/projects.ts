import insforge from '@lib/insforge';
import { ProjectSchema, type Project } from '@schemas/project';
import { z } from 'zod';

/**
 * Fetch all published projects with their specs and images.
 * Data is validated with Zod before returning.
 */
export async function getPublishedProjects(): Promise<Project[]> {
  const { data, error } = await insforge.database
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[services/projects] Fetch error:', error.message);
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  const result = z.array(ProjectSchema).safeParse(data);

  if (!result.success) {
    console.error('[services/projects] Validation error:', result.error.format());
    throw new Error('Invalid project data from InsForge');
  }

  return result.data;
}

/**
 * Fetch a single project by slug.
 */
export async function getProjectBySlug(slug: string): Promise<Project> {
  const { data, error } = await insforge.database
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`[services/projects] Project "${slug}" not found:`, error.message);
    throw new Error(`Project not found: ${slug}`);
  }

  const result = ProjectSchema.safeParse(data);

  if (!result.success) {
    console.error('[services/projects] Validation error:', result.error.format());
    throw new Error('Invalid project data');
  }

  return result.data;
}
