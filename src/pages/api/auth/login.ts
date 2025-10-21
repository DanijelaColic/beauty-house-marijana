import type { APIRoute } from "astro";
import { supabase as dbClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export const prerender = false;

const url = import.meta.env.PUBLIC_SUPABASE_URL!;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY!;
const authClient = createClient(url, anon); // bez db.schema

export const POST: APIRoute = async ({ request }) => {
  const { email, password } = await request.json();

  const { data, error } = await authClient.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password),
  });
  if (error) {
    const msg = error.message || "Auth error";
    return new Response(/invalid/i.test(msg) ? "Invalid login credentials" : msg, {
      status: /invalid/i.test(msg) ? 401 : 500,
    });
  }

  // (opcija) nakon uspješnog logina možeš dohvatiti staff profil:
  const { data: staff } = await dbClient
    .from("staff_profiles")
    .select("id, role, display_name, active")
    .eq("user_id", data.user?.id)
    .maybeSingle();

  return new Response(JSON.stringify({ ok: true, user: data.user, staff }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
