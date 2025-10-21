// scripts/test_login_fix.mjs
import { createClient } from "@supabase/supabase-js";

// Uzmi URL/KEY iz server okruženja.
// Preferiramo serverske varijante; fallback na PUBLIC_* ako su ti tako postavljene.
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Missing env: set SUPABASE_URL and SUPABASE_ANON_KEY (ili PUBLIC_* varijante)."
  );
  process.exit(1);
}

// ⬅️ KLJUČNO: dodaj shemu "public"
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: "public" },
});

async function testLogin() {
  console.log("🔎 Testing login for djelatnik@beautyhouse.com ...");

  // 1) Auth
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: "djelatnik@beautyhouse.com",
      password: "StaffNEW123!", // promijeni ako si resetirala
    });

  if (authError) {
    console.error("❌ Authentication failed:", authError.message);
    return;
  }

  console.log("✅ Authentication successful");
  console.log("   user id:", authData.user?.id);

  // 2) Staff profil
  const { data: profile, error: profileError } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle(); // tolerantnije od .single()

  if (profileError) {
    console.error(
      "❌ Staff profile lookup failed:",
      profileError.message || profileError
    );
    return;
  }

  if (!profile) {
    console.warn("⚠️  No staff profile found for this user.");
    return;
  }

  console.log("✅ Staff profile found:");
  console.log("   email:", profile.email);
  console.log("   full_name:", profile.full_name);
  console.log("   role:", profile.role);
  console.log("   active:", profile.active);

  if (profile.active) {
    console.log("🎉 Login fix successful! User can access staff area.");
  } else {
    console.log("⚠️  Profile exists but is inactive.");
  }
}

testLogin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Unexpected error:", e?.message || e);
    process.exit(1);
  });
