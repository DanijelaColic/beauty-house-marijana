// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // promijeni na produkcijsku domenu nakon deploya
  site: "http://localhost:4321",
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // koristimo svoje global.css base stilove
    }),
    sitemap(),
  ],
  server: { port: 4321 },
});
