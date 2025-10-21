// src/pages/api/health-db.ts
import type { APIRoute } from "astro";
import { supabase } from "@/lib/supabase";

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, name")
      .limit(1);

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, servicesPeek: data }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(e?.message ?? "health-db error", { status: 500 });
  }
};
