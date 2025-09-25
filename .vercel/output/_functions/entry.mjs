import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DJs8OmPw.mjs';
import { manifest } from './manifest_DOrvVM-l.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/availability.astro.mjs');
const _page2 = () => import('./pages/api/book.astro.mjs');
const _page3 = () => import('./pages/api/services.astro.mjs');
const _page4 = () => import('./pages/rezervacije/uspjeh.astro.mjs');
const _page5 = () => import('./pages/rezervacije.astro.mjs');
const _page6 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/availability.ts", _page1],
    ["src/pages/api/book.ts", _page2],
    ["src/pages/api/services.ts", _page3],
    ["src/pages/rezervacije/uspjeh.astro", _page4],
    ["src/pages/rezervacije.astro", _page5],
    ["src/pages/index.astro", _page6]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "6efe6f56-0955-4c16-a508-25704489ad7f",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
