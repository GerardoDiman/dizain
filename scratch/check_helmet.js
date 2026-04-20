import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: process.env.INSFORGE_BASE_URL,
  anonKey: process.env.INSFORGE_ANON_KEY,
});

async function checkHelmet() {
  const { data, error } = await client.database
    .from('projects')
    .select('*, project_specs(*), project_images(*)')
    .eq('slug', 'f1-helmet')
    .eq('lang', 'en')
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Helmet Data:');
  console.log(JSON.stringify(data, null, 2));
}

checkHelmet();
