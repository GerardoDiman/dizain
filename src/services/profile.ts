import { supabase } from '@lib/supabase';
import { ProfileSchema, type Profile } from '@schemas/profile';

/**
 * Fetch the designer's profile (single row).
 */
export async function getProfile(lang: string = 'es'): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    console.error('[services/profile] No profile found.');
    return null;
  }

  // Helper to extract translation
  const translate = (field: any, l: string, fallback: any = '') => {
    if (!field) return fallback;
    if (typeof field === 'string' || Array.isArray(field)) return field;
    return field[l] || field['es'] || Object.values(field)[0] || fallback;
  };

  const translatedProfile = {
    ...data,
    title: translate(data.title, lang),
    bio: translate(data.bio, lang, [])
  };

  const result = ProfileSchema.safeParse(translatedProfile);

  if (!result.success) {
    console.error('[services/profile] Validation error:', JSON.stringify(result.error.format(), null, 2));
    return translatedProfile as Profile;
  }

  return result.data;
}

