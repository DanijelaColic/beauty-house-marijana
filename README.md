# Beauty House by Marijana Talović — Astro + React + Tailwind

Minimalan, brz i responzivan web za frizerski salon s vlastitim sustavom online rezervacija.

## 🚀 Pokretanje

```bash
npm i
npm run dev
```

> Port je 4321 (možeš promijeniti u `astro.config.mjs`).

## 📅 Booking sustav

Vlastiti 5-step booking sistem:
1. **Odabir usluge** - lista usluga s cijenama
2. **Odabir djelatnika** - 6 djelatnika s avatarima  
3. **Datum i vrijeme** - kalendar s dostupnim terminima
4. **Podaci kupca** - ime, email, telefon, napomena
5. **Potvrda** - sažetak rezervacije

### API rute:
- `/api/services` - dohvaćanje usluga
- `/api/staff` - dohvaćanje djelatnika
- `/api/availability` - provjera dostupnih termina
- `/api/book` - kreiranje rezervacije

### Baza podataka:
- Supabase integracija za pohranu podataka
- Mock podaci za djelatnike
- Validacija s Zod schemama

## 🔐 Security / CSP

U `BaseLayout.astro` postoji **Content-Security-Policy** za sigurnost.

## 🧭 SEO & OG

- `BaseLayout.astro` s title/meta/OG tagovima i `schema.org` JSON-LD za `HairSalon`.
- `@astrojs/sitemap` plugin — obavezno postavi ispravni `site` u `astro.config.mjs`.
- `public/robots.txt` već pokazuje na `/sitemap-index.xml`.

## ♿ Accessibility

- Dobar kontrast, fokus stilovi, `aria-*` i alt tekstovi gdje je potrebno.
- CTA-i su pravi `<button>`/`<a>` s jasnim nazivima.

## 📁 Struktura

```
src/
  components/
  layouts/
  pages/
  styles/
public/
```

## 🧩 Paleta i tipografija

- Primarna: `#2563EB`
- Sekundarna: `#0EA5E9`
- Pozadina: `#F8FAFC`
- Tekst: `#0F172A` / `#334155`
- Font: `system-ui` (bez eksternih fontova radi CSP-a; lako zamjenjivo s Inter).

## 🗂️ Build & Deploy (Vercel)

- Repo push na GitHub, poveži projekt na Vercel.
- Dodaj **Environment Variables** za Supabase u Vercel dashboard.
- `vercel.json` nije potreban; Astro radi out-of-the-box.

Sretno! ✂️💙
