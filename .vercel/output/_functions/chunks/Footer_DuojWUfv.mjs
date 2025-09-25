import { e as createComponent, f as createAstro, r as renderTemplate, n as renderSlot, o as renderHead, h as addAttribute, m as maybeRenderHead } from './astro/server_DFoPc-bF.mjs';
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
      frame-src 'self' https://*.zoyya.com https://*.zoyya.net https://*.google.com https://www.google.com https://maps.google.com;
      frame-ancestors 'self';
      form-action 'self';
      upgrade-insecure-requests;
    "><script type="application/ld+json">{JSON.stringify(jsonLd)}<\/script>`, '</head> <body class="bg-background text-textPrimary"> ', " </body></html>"])), title, addAttribute(description, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(site, "content"), addAttribute(ogUrl, "content"), addAttribute(title, "content"), addAttribute(description, "content"), addAttribute(ogUrl, "content"), renderHead(), renderSlot($$result, $$slots["default"]));
}, "/home/orisnik/projects/beauty-house-marijana/src/layouts/BaseLayout.astro", void 0);

const $$Header = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<!-- tanji taupe header (≈64px) -->${maybeRenderHead()}<header class="sticky top-0 z-50 bg-headerTaupe shadow-[0_2px_12px_rgba(0,0,0,0.18)]"> <nav class="mx-auto max-w-7xl px-4 h-20 flex items-center justify-between"> <!-- Logo + naziv --> <a href="/" class="flex items-center gap-3 no-underline"> <img src="/new-logo.png" alt="Beauty House by Marijana Talović — logo" class="w-16 h-16 object-contain"> <span class="text-base md:text-lg font-semibold text-white/95">Beauty House by Marijana Talović</span> </a> <!-- Desktop navigacija --> <div class="hidden md:flex items-center gap-8"> <a href="/" class="text-[15px] text-white/90 hover:text-white">Početna</a> <a href="#usluge" class="text-[15px] text-white/90 hover:text-white">Usluge</a> <a href="#about" class="text-[15px] text-white/90 hover:text-white">O nama</a> <a href="#kontakt" class="text-[15px] text-white/90 hover:text-white">Kontakt</a> <!-- kompaktniji CTA --> <a href="#rezervacije" class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-ctaDark text-white font-medium hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60">
Rezervacija
</a> </div> <!-- Mobile izbornik --> <details class="md:hidden relative"> <summary class="list-none p-1.5 -mr-1.5 rounded-lg text-white/95 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer" aria-label="Otvori izbornik"> <svg width="24" height="24" fill="none" stroke="currentColor" class="text-white"> <path stroke-linecap="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16"></path> </svg> </summary> <div class="absolute right-0 mt-2 w-56 rounded-xl bg-headerTaupe text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] overflow-hidden"> <a href="/" class="block px-4 py-2 hover:bg-white/10">Početna</a> <a href="#usluge" class="block px-4 py-2 hover:bg-white/10">Usluge</a> <a href="#about" class="block px-4 py-2 hover:bg-white/10">O nama</a> <a href="#kontakt" class="block px-4 py-2 hover:bg-white/10">Kontakt</a> <a href="#rezervacije" class="block px-4 py-2 bg-ctaDark text-center">Rezervacija</a> </div> </details> </nav> </header>`;
}, "/home/orisnik/projects/beauty-house-marijana/src/components/Header.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="mt-16 border-t border-slate-200"> <div class="mx-auto max-w-7xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4"> <p class="text-sm text-slate-600">© ${(/* @__PURE__ */ new Date()).getFullYear()} Beauty House by Marijana Talović. Sva prava pridržana.</p> <nav class="flex items-center gap-6 text-sm"> <a href="/privatnost" class="text-slate-600 hover:text-slate-800">Privatnost</a> <a href="/uvjeti" class="text-slate-600 hover:text-slate-800">Uvjeti</a> <a href="#kontakt" class="text-slate-600 hover:text-slate-800">Kontakt</a> </nav> </div> </footer>`;
}, "/home/orisnik/projects/beauty-house-marijana/src/components/Footer.astro", void 0);

export { $$Header as $, $$Footer as a, $$BaseLayout as b };
