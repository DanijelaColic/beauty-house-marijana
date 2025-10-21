// src/pages/api/auth-debug.ts
import type { APIRoute } from "astro";
import { createServerClient } from "@supabase/ssr";

export const GET: APIRoute = async ({ cookies, request }) => {
  // Možeš koristiti i process.env.SUPABASE_URL / SUPABASE_ANON_KEY ako želiš strictly server env
  const supabase = createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL!,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY!,
    {
      // ⬇️ KLJUČNO za Hardened Data API
      db: { schema: "public" },

      // SSR cookie bridge
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => cookies.set(key, value, options),
        remove: (key, options) => cookies.delete(key, options),
      },

      // Dopuštamo prosljeđivanje Bearer tokena iz klijenta (ako ga šalješ u Authorization headeru)
      global: {
        headers: {
          Authorization: request.headers.get("Authorization") ?? "",
        },
      },
    }
  );

  const {
    data: { user },
    error: uErr,
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

  const { data: profile, error: pErr } = await supabase
    .from("staff_profiles")
    .select("id, email, role, active")
    .eq("id", user.id)
    .maybeSingle();

  return new Response(
    JSON.stringify({ user, profile, uErr, pErr }, null, 2),
    { status: 200, headers: { "content-type": "application/json" } }
  );
};
