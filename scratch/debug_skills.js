
import { createClient } from '@insforge/sdk';
import { z } from 'zod';

const client = createClient({
  baseUrl: 'https://dizain-backend.insforge.app', // De tus metadatos
  anonKey: 'your-anon-key' // Necesito obtener esto
});

const SkillCategoryEnum = z.enum([
  'software',
  'education',
  'languages',
  'design',
]);

const SkillSchema = z.object({
  id: z.string().uuid(),
  category: SkillCategoryEnum,
  label: z.string().min(1),
  sort_order: z.number().int(),
  created_at: z.string(),
});

async function test() {
  const { data, error } = await client.database
    .from('skills')
    .select('*')
    .eq('lang', 'es')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('FETCH ERROR:', error);
    return;
  }

  console.log('DATA FROM DB:', data.length, 'rows');
  
  const result = z.array(SkillSchema).safeParse(data);
  if (!result.success) {
    console.error('VALIDATION ERROR:', JSON.stringify(result.error.format(), null, 2));
  } else {
    console.log('VALIDATION SUCCESS');
  }
}

test();
