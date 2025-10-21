import { s as supabase } from '../../../chunks/supabase_Cjh8S1vc.mjs';
import { createClient } from '@supabase/supabase-js';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const url = "https://fzhpazheyemdmrtzdckl.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6aHBhemhleWVtZG1ydHpkY2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjgxOTcsImV4cCI6MjA3NDIwNDE5N30.n48ZTt7xco6M4nQRRvrgf3W91GNq6JzwsGIZ_IcBLpo";
const authClient = createClient(url, anon);
const POST = async ({ request }) => {
  const { email, password } = await request.json();
  const { data, error } = await authClient.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password)
  });
  if (error) {
    const msg = error.message || "Auth error";
    return new Response(/invalid/i.test(msg) ? "Invalid login credentials" : msg, {
      status: /invalid/i.test(msg) ? 401 : 500
    });
  }
  const { data: staff } = await supabase.from("staff_profiles").select("id, role, display_name, active").eq("user_id", data.user?.id).maybeSingle();
  return new Response(JSON.stringify({ ok: true, user: data.user, staff }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
