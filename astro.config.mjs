import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://tvoja-domena.hr", // po želji
  output: "static",
  integrations: [tailwind(), sitemap()],
});
