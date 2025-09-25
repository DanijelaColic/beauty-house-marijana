import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/server";

export default defineConfig({
  site: "https://beauty-house-marijana.vercel.app",
  output: "server",   // VAŽNO: API rute rade samo u server modu
  adapter: vercel(),  // Vercel adapter
  
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],

  server: {
    port: 4321,
  },
});
