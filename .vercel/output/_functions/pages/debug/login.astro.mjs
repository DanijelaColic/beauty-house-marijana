/* empty css                                    */
import { e as createComponent, r as renderTemplate, l as renderHead } from '../../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import 'clsx';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template(['<html lang="hr"> <head><meta charset="utf-8"><title>Login Debug</title>', '</head> <body style="font-family:sans-serif; max-width:520px; margin:2rem auto;"> <h1>Login Debug</h1> <form id="f" style="display:grid; gap:.5rem;"> <label>Email\n<input id="email" type="email" value="admin@beautyhouse.com" required> </label> <label>Lozinka\n<input id="pw" type="password" value="Admin123!" required> </label> <button type="submit" style="justify-self:end;">Prijava</button> <pre id="out"></pre> </form> <!-- VA\u017DNO: eksterni modul, bez inline JS-a --> <script type="module" src="/src/scripts/login-debug.ts"><\/script> </body> </html>'])), renderHead());
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/debug/login.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/debug/login.astro";
const $$url = "/debug/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
