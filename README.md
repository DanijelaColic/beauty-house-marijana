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

**Javne rute (bez autentifikacije):**
- `/api/services` - dohvaćanje usluga
- `/api/staff` - dohvaćanje djelatnika
- `/api/availability` - provjera dostupnih termina
- `/api/book` - kreiranje rezervacije (guest booking)

**Zaštićene rute (samo za osoblje):**
- `/api/auth/login` - prijava osoblja
- `/api/auth/logout` - odjava
- `/api/auth/session` - provjera sesije
- `/api/admin/bookings` - upravljanje rezervacijama

### Baza podataka:
- Supabase integracija za pohranu podataka
- Supabase Auth za autentifikaciju osoblja
- Row Level Security (RLS) za sigurnost podataka
- Mock podaci za djelatnike
- Validacija s Zod schemama

## 🔐 Autentifikacija osoblja

Sistem podržava prijavu samo za osoblje (owner i staff uloge):

- **Guest booking**: Kupci mogu rezervisati termine bez prijave
- **Staff login**: Osoblje se prijavljuje na `/admin/login`
- **Admin panel**: Pregled i upravljanje rezervacijama na `/admin`
- **Uloge**:
  - `owner` - Pun pristup svim funkcijama
  - `staff` - Pristup rezervacijama

**Setup uputstva**: Pogledaj `AUTH_SETUP.md` za detaljne upute.

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
- Dodaj **Environment Variables** za Supabase u Vercel dashboard:
  - `PUBLIC_SUPABASE_URL`
  - `PUBLIC_SUPABASE_ANON_KEY`
  - (Opciono) `RESEND_API_KEY` za email notifikacije
- `vercel.json` nije potreban; Astro radi out-of-the-box.

## 📚 Dokumentacija

- `AUTH_SETUP.md` - Detaljne upute za setup autentifikacije
- `TEST_LOGIN_GUIDE.md` - Upute za testiranje prijave sa test korisnicima
- `BOOKING_SETUP.md` - Upute za booking sistem
- `VERCEL_ENV_SETUP.md` - Upute za Vercel environment varijable
- `supabase_setup.sql` - SQL shema za osnovnu bazu
- `supabase_auth_setup.sql` - SQL shema za autentifikaciju
- `test_users_setup.sql` - SQL za kreiranje test korisnika

Sretno! ✂️💙
