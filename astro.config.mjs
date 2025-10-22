import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/static";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://beauty-house-marijana.vercel.app",
  output: "static",
  adapter: vercel(),
  integrations: [react(), tailwind(), sitemap()],
});