import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/server";

export default defineConfig({
  site: "https://beauty-house-marijana.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
});
