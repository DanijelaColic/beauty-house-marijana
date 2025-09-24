/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_BUSINESS_NAME: string;
  readonly PUBLIC_BUSINESS_EMAIL: string;
  readonly PUBLIC_BUSINESS_TIMEZONE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}