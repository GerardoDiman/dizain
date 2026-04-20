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

  if (error || !data) {
    console.warn(`[services/profile] Profile for "${lang}" not found, trying fallback...`);
    const { data: fallbackData, error: fallbackError } = await insforge.database
      .from('profiles')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (fallbackError || !fallbackData) {
      console.error('[services/profile] No profile found in any language.');
      return null;
    }
    const fallbackResult = ProfileSchema.safeParse(fallbackData);
    return fallbackResult.success ? fallbackResult.data : null;
  }

  const result = ProfileSchema.safeParse(data);

  if (!result.success) {
    console.error('[services/profile] Validation error:', result.error.format());
    return null;
  }

  return result.data;
}
