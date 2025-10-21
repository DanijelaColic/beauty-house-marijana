import { supabase } from "@/lib/supabase";

function q<T extends HTMLElement>(sel: string) {
  const el = document.querySelector(sel) as T | null;
  if (!el) throw new Error(`Element not found: ${sel}`);
  return el;
}

async function onSubmit(e: Event) {
  e.preventDefault();

  const out = q<HTMLPreElement>("#out");
  const email = q<HTMLInputElement>("#email").value.trim();
  const pw = q<HTMLInputElement>("#pw").value;

  out.textContent = "Prijava…";

  // 1️⃣ Pokušaj login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pw,
  });

  console.log("LOGIN RES:", { data, error });

  if (error) {
    out.textContent = "Greška: " + error.message;
    return;
  }

  // 2️⃣ Provjeri session
  const { data: { session }, error: sErr } = await supabase.auth.getSession();
  console.log("SESSION:", { session, sErr });

  if (!session) {
    out.textContent = "Nema aktivne sesije. Provjeri domenu ili cookies.";
    return;
  }

  // 3️⃣ Pošalji token backendu radi provjere
  const res = await fetch("/api/auth-debug", {
    headers: { Authorization: `Bearer ${session.access_token}` },
  }).catch(err => ({ ok: false, json: async () => ({ fetchError: String(err) }) }));

  const json = res && "ok" in res ? await res.json() : { note: "No response" };
  console.log("AUTH-DEBUG JSON:", json);

  if (json?.user && json?.profile) {
    out.textContent = "Uspjeh! Preusmjeravam na /debug/auth ...";
    location.href = "/debug/auth";
  } else {
    out.textContent = "Greška: " + (json?.note || "Nepoznata greška");
  }
}

function main() {
  const form = q<HTMLFormElement>("#f");
  form.addEventListener("submit", onSubmit);
  console.log("✅ login-debug.ts učitan i spreman");
}

main();
