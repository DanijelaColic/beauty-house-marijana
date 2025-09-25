import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless"; // ili "@astrojs/vercel/edge"

export default defineConfig({
  site: "https://tvoja-domena.hr",
  output: "server",        // SSR!
  adapter: vercel(),
  integrations: [tailwind(), sitemap(), react()],
});
