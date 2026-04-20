import { createClient } from '@insforge/sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  baseUrl: process.env.INSFORGE_BASE_URL,
  anonKey: process.env.INSFORGE_ANON_KEY,
});

async function checkProjects() {
  const { data, error } = await client.database
    .from('projects')
    .select('id, slug, lang, is_published, title');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Projects in DB:');
  console.table(data);
}

checkProjects();
