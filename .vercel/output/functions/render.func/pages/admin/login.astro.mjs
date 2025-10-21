/* empty css                                    */
import { e as createComponent, f as createAstro, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_BpigWmc2.mjs';
import 'kleur/colors';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_P_euJCoa.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import React__default from 'react';
export { renderers } from '../../renderers.mjs';

function LoginForm() {
  const [email, setEmail] = React__default.useState("");
  const [password, setPassword] = React__default.useState("");
  const [error, setError] = React__default.useState(null);
  const [loading, setLoading] = React__default.useState(false);
  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Login failed:", res.status, text);
        setError(text || `Login error ${res.status}`);
        return;
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err?.message ?? "Unexpected error");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "email",
        value: email,
        onChange: (e) => setEmail(e.target.value),
        placeholder: "Email",
        className: "input input-bordered w-full",
        required: true
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "password",
        value: password,
        onChange: (e) => setPassword(e.target.value),
        placeholder: "Lozinka",
        className: "input input-bordered w-full",
        required: true
      }
    ),
    error && /* @__PURE__ */ jsx("p", { className: "text-red-500 text-sm", children: error }),
    /* @__PURE__ */ jsx("button", { className: "btn btn-primary w-full", disabled: loading, children: loading ? "Prijava..." : "Prijavi se" })
  ] });
}

const $$Astro = createAstro();
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const sessionCookie = Astro2.cookies.get("staff_session");
  if (sessionCookie) {
    try {
      const sessionCheck = await fetch(`${Astro2.url.origin}/api/auth/session`, {
        headers: {
          "Cookie": `staff_session=${sessionCookie.value}`
        }
      });
      if (sessionCheck.ok) {
        return Astro2.redirect("/admin");
      }
    } catch (err) {
      console.error("Session check error:", err);
    }
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Prijava | Beauty House Marijana", "description": "Prijava za osoblje Beauty House Marijana" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"> ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/auth/LoginForm", "client:component-export": "default" })} </div> ` })}`;
}, "/home/orisnik/projects/beauty-house-marijana/src/pages/admin/login.astro", void 0);

const $$file = "/home/orisnik/projects/beauty-house-marijana/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
