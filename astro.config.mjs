import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";
import react from "@astrojs/react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  site: "https://beauty-house-marijana.vercel.app",
  output: "server",
  adapter: vercel({
    functionPerRoute: false,
  }),
  integrations: [react(), tailwind(), sitemap()],
  vite: {
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
      preserveSymlinks: false,
    },
    ssr: {
      noExternal: ['@supabase/supabase-js', '@supabase/ssr'],
    },
  },
});