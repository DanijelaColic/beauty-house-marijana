import { createServerClient } from '@supabase/ssr';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = async ({ cookies, request }) => {
  const supabase = createServerClient(
    "https://fzhpazheyemdmrtzdckl.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aHBhemhleWVtZG1ydHpkY2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjgxOTcsImV4cCI6MjA3NDIwNDE5N30.n48ZTt7xco6M4nQRRvrgf3W91GNq6JzwsGIZ_IcBLpo",
    {
      // ⬇️ KLJUČNO za Hardened Data API
      db: { schema: "public" },
      // SSR cookie bridge
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => cookies.set(key, value, options),
        remove: (key, options) => cookies.delete(key, options)
      },
      // Dopuštamo prosljeđivanje Bearer tokena iz klijenta (ako ga šalješ u Authorization headeru)
      global: {
        headers: {
          Authorization: request.headers.get("Authorization") ?? ""
        }
      }
    }
  );
  const {
    data: { user },
    error: uErr
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(
      JSON.stringify(
        { user: null, profile: null, note: "Not authenticated", uErr },
        null,
        2
      ),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }
  const { data: profile, error: pErr } = await supabase.from("staff_profiles").select("id, email, role, active").eq("id", user.id).maybeSingle();
  return new Response(
    JSON.stringify({ user, profile, uErr, pErr }, null, 2),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
