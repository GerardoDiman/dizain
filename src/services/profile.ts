import insforge from '@lib/insforge';
import { ProfileSchema, type Profile } from '@schemas/profile';

/**
 * Fetch the designer's profile (single row).
 */
export async function getProfile(lang: string = 'es'): Promise<Profile | null> {
  const { data, error } = await insforge.database
    .from('profiles')
    .select('*')
    .eq('lang', lang)
    .single();

  if (error) {
    console.error('[services/profile] Fetch error:', error.message);
    return null;
  }

  const result = ProfileSchema.safeParse(data);

  if (!result.success) {
    console.error('[services/profile] Validation error:', result.error.format());
    return null;
  }

  return result.data;
}
