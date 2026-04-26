import { z } from 'zod';

const TranslationSchema = z.record(z.string()).or(z.string());
const BioTranslationSchema = z.record(z.array(z.string())).or(z.array(z.string()));

export const ProfileSchema = z.object({
  id: z.string().uuid().optional(),
  full_name: z.string().min(1),
  title: TranslationSchema,
  bio: BioTranslationSchema,
  email: z.string().email().nullable(),
  linkedin_url: z.string().nullable(),
  behance_url: z.string().nullable(),
  cv_url: z.string().nullable(),
  profile_image_url: z.string().nullable(),
  version_tag: z.string().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Profile = z.infer<typeof ProfileSchema>;
