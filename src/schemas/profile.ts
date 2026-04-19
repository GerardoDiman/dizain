import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1),
  title: z.string().min(1),
  bio: z.array(z.string()),
  email: z.string().email().nullable(),
  linkedin_url: z.string().url().nullable(),
  behance_url: z.string().url().nullable(),
  cv_url: z.string().url().nullable(),
  profile_image_url: z.string().url().nullable(),
  version_tag: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof ProfileSchema>;
