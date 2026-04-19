import { createClient } from '@insforge/sdk';

/**
 * InsForge client singleton.
 * Used server-side at build time (SSG) to fetch data.
 */
const insforge = createClient({
  baseUrl: import.meta.env.INSFORGE_BASE_URL,
  anonKey: import.meta.env.INSFORGE_ANON_KEY,
});

export default insforge;
