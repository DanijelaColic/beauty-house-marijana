import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_0K7GfXwU.mjs';
import { manifest } from './manifest_KTR51swp.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/login.astro.mjs');
const _page2 = () => import('./pages/admin.astro.mjs');
const _page3 = () => import('./pages/api/admin/bookings.astro.mjs');
const _page4 = () => import('./pages/api/auth/login.astro.mjs');
const _page5 = () => import('./pages/api/auth/logout.astro.mjs');
const _page6 = () => import('./pages/api/auth/session.astro.mjs');
const _page7 = () => import('./pages/api/auth-debug.astro.mjs');
const _page8 = () => import('./pages/api/availability.astro.mjs');
const _page9 = () => import('./pages/api/book.astro.mjs');
const _page10 = () => import('./pages/api/health-db.astro.mjs');
const _page11 = () => import('./pages/api/services.astro.mjs');
const _page12 = () => import('./pages/api/staff.astro.mjs');
const _page13 = () => import('./pages/debug/auth.astro.mjs');
const _page14 = () => import('./pages/debug/login.astro.mjs');
const _page15 = () => import('./pages/rezervacije/uspjeh.astro.mjs');
const _page16 = () => import('./pages/rezervacije.astro.mjs');
const _page17 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/login.astro", _page1],
    ["src/pages/admin/index.astro", _page2],
    ["src/pages/api/admin/bookings.ts", _page3],
    ["src/pages/api/auth/login.ts", _page4],
    ["src/pages/api/auth/logout.ts", _page5],
    ["src/pages/api/auth/session.ts", _page6],
    ["src/pages/api/auth-debug.ts", _page7],
    ["src/pages/api/availability.ts", _page8],
    ["src/pages/api/book.ts", _page9],
    ["src/pages/api/health-db.ts", _page10],
    ["src/pages/api/services.ts", _page11],
    ["src/pages/api/staff.ts", _page12],
    ["src/pages/debug/auth.astro", _page13],
    ["src/pages/debug/login.astro", _page14],
    ["src/pages/rezervacije/uspjeh.astro", _page15],
    ["src/pages/rezervacije.astro", _page16],
    ["src/pages/index.astro", _page17]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "fa7deac9-4e1d-4a42-aad7-953d5e8e86fa",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
