import { e as createComponent, f as createAstro, r as renderTemplate, o as renderSlot, l as renderHead, h as addAttribute } from './astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const site = Astro2.site?.toString().replace(/\/$/, "") ?? "";
  const ogUrl = `${site}/og-image.jpg`;
  const {
    title = "Beauty House by Marijana Talovi\u0107",
    description = "Elegantna njega kose u Osijeku. Brze online rezervacije i vrhunska usluga.",
    ogImage = ogUrl,
    canonical = site
  } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="hr"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>', '</title><meta name="description"', '><!-- Open Graph --><meta property="og:type" content="website"><meta property="og:title"', '><meta property="og:description"', '><meta property="og:url"', '><meta property="og:image"', '><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Beauty House by Marijana Talovi\u0107 \u2013 frizerski salon Osijek"><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"', '><meta name="twitter:description"', '><meta name="twitter:image"', `><!-- Favicon (nije za preview, ali dobro imati) --><link rel="icon" href="/favicon.png"><!-- CSP: pro\u0161iri domene po potrebi --><meta http-equiv="Content-Security-Policy" content="
      default-src 'self';
      base-uri 'self';
      object-src 'none';
      img-src 'self' data: blob: https:;
      font-src 'self' https: data:;
      style-src 'self' 'unsafe-inline';
      script-src 'self' 'unsafe-inline';
      connect-src 'self' https:;
      frame-src 'self' https://*.google.com https://www.google.com https://maps.google.com;
      frame-ancestors 'self';
      form-action 'self';
      upgrade-insecure-requests;
    "><script type="application/ld+json">{JSON.stringify(jsonLd)}<\/script>`, '</head> <body class="bg-background text-textPrimary"> ', " </body></html>"])), title, addAttribute(description, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(site, "content"), addAttribute(ogUrl, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(ogUrl, "content"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/home/orisnik/projects/beauty-house-marijana/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
