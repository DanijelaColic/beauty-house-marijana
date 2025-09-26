import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless"; // ili "/edge"

export default defineConfig({
  site: "https://beauty-house-marijana.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [tailwind(), sitemap(), react()],
});
