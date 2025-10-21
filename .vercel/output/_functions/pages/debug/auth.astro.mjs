/* empty css                                    */
import { e as createComponent, r as renderTemplate, l as renderHead } from '../../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Auth = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<html lang="hr"> <head><meta charset="utf-8"><title>Auth Debug</title>', '</head> <body> <h1>Auth Debug</h1> <pre id="out">Loading\u2026</pre> <script type="module" src="/src/scripts/auth-debug.ts"><\/script> </body> </html>'])), renderHead());
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/debug/auth.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/debug/auth.astro";
const $$url = "/debug/auth";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Auth,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
