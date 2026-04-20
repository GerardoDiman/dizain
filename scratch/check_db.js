import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: process.env.INSFORGE_BASE_URL,
  anonKey: process.env.INSFORGE_ANON_KEY,
});

async function checkDb() {
  console.log('--- Projects ---');
  const { data: projects, error: pError } = await client.database
    .from('projects')
    .select('id, slug, lang, is_published, title');
  
  if (pError) console.error('Projects Error:', pError);
  else console.table(projects);

  console.log('--- Profiles ---');
  const { data: profiles, error: prError } = await client.database
    .from('profiles')
    .select('lang, full_name');
  
  if (prError) console.error('Profile Error:', prError);
  else console.table(profiles);
}

checkDb();
