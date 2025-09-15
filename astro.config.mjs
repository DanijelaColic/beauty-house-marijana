// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // Stavi produkcijsku domenu kad je deploy gotov
  site: "https://beauty-house-marijana.vercel.app",

  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // koristimo vlastite global.css stilove
    }),
    sitemap(),
  ],

  server: {
    port: 4321, // lokalni dev port
  },
});
