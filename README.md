# Beauty House by Marijana Talović — Astro + React + Tailwind

Minimalan, brz i responzivan web za frizerski salon sa Zoyya online rezervacijama i AI modulom za prijedlog slobodnih termina.

## 🚀 Pokretanje

```bash
npm i
npm run dev
```

> Port je 4321 (možeš promijeniti u `astro.config.mjs`).

## 🔗 Zoyya embed (Booking widget)

1. Od Zoyye preuzmi **embed URL** (iframe/script).
2. U `.env` datoteci postavi:
   ```env
   PUBLIC_ZOYYA_WIDGET_URL="https://tvoj-zoyya-widget-url"
   ```
3. Komponenta `src/components/BookingWidget.jsx` čita varijablu i renderira responsive `iframe`.

> Ako Zoyya podržava URL parametre za *pre-filled* datum/vrijeme, `SmartSuggestions` će otvoriti `?date=YYYY-MM-DD&time=HH:mm`. Inače, klik samo scrolla na widget.

## 🤖 AI modul — SmartSuggestions

Komponenta `src/components/SmartSuggestions.jsx`:
- Ulazi (UI): usluga (trajanje), preferirano doba dana (jutro/popodne/večer), raspon datuma (danas / sutra / ovaj tjedan / sljedeći tjedan).
- Logika: generira slotove unutar radnog vremena, uklanja zauzete (*mock*), rangira po:
  1) najraniji slobodan,
  2) minimalni “razbijeni” gap,
  3) poklapanje s preferencijama.
- Izlaz: 3–5 čipova s prijedlozima. Klik → skrol na widget i (ako podržano) otvaranje Zoyya URL-a s parametrima.

> **Integracija s pravim kalendarom:** Ako Zoyya nudi API (ili iCal feed), zamijeni `busySlotsMock` u `SmartSuggestions.jsx` stvarnim podacima i/ili fetchom.

## 🔐 Security / CSP

U `BaseLayout.astro` postoji **Content-Security-Policy**. Po potrebi dodaj domene koje Zoyya koristi (npr. `frame-src https://*.zoyya.com https://*.zoyya.net`). Ako ugrađuješ skripte drugih dobavljača (Analytics, itd.), proširi `script-src`, `connect-src` i dr.

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
- Dodaj **Environment Variable** `PUBLIC_ZOYYA_WIDGET_URL` i *Site URL* u `astro.config.mjs`.
- `vercel.json` nije potreban; Astro radi out-of-the-box.

Sretno! ✂️💙
