/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly INSFORGE_BASE_URL: string;
  readonly INSFORGE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
