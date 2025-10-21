# Upute za konfiguraciju autentifikacije osoblja

## Pregled

Sistem za rezervacije sada podržava **autentifikaciju samo za osoblje** (owner i staff) koristeći **Supabase Auth**. Kupci i dalje mogu rezervisati termine bez prijave ("guest booking").

## 1. Supabase Setup

### 1.1 Kreiranje projekta

1. Idi na [Supabase Dashboard](https://supabase.com/dashboard)
2. Kreiraj novi projekat ili koristi postojeći
3. Zapiši **Project URL** i **anon/public key**

### 1.2 Pokretanje SQL skripti

#### Osnovna shema (ako već nisi pokrenuo)

```bash
# U Supabase SQL Editor pokreni:
supabase_setup.sql
```

#### Auth shema za osoblje

```bash
# U Supabase SQL Editor pokreni:
supabase_auth_setup.sql
```

Ova skripta će:
- Kreirati `staff_profiles` tabelu
- Postaviti RLS (Row Level Security) policies
- Kreirati helper funkcije (`is_owner()`, `is_staff()`, `get_staff_role()`)
- Omogućiti zaštitu podataka na nivou baze

## 2. Environment Variables

Dodaj ili ažuriraj sljedeće environment varijable:

```env
# Supabase
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel deployment

```bash
# Dodaj env varijable u Vercel Dashboard
vercel env add PUBLIC_SUPABASE_URL
vercel env add PUBLIC_SUPABASE_ANON_KEY

# Ili koristi Vercel CLI
vercel env pull
```

## 3. Kreiranje prvog Owner korisnika

### Opcija A: Kroz Supabase Dashboard (PREPORUČENO)

1. Idi na **Authentication > Users** u Supabase Dashboard
2. Klikni **Add user** > **Create new user**
3. Unesi:
   - Email: `vas.email@example.com`
   - Password: `JakaSifra123!` (ili bilo koja jaka šifra)
   - Auto Confirm: ✅ (da se automatski verificira email)
4. Klikni **Create user**
5. Kopiraj **User ID** (UUID)
6. U **SQL Editor**, pokreni:

```sql
UPDATE public.staff_profiles
SET role = 'owner', full_name = 'Vaše Ime'
WHERE id = 'ZAMIJENITE_SA_USER_ID';
```

### Opcija B: Kroz SQL (alternativa)

U **SQL Editor** pokreni:

```sql
-- PROMIJENI EMAIL I PASSWORD!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'vas.email@example.com',
  crypt('VasaJakaSifra123!', gen_salt('bf')),
  NOW(),
  '{"role": "owner", "full_name": "Vaše Ime"}',
  NOW(),
  NOW(),
  '',
  ''
);
```

## 4. Struktura sistema

### Uloge

- **owner**: Pun pristup - može upravljati svim postavkama, rezervacijama, uslugama i osobljem
- **staff**: Pristup rezervacijama - može vidjeti i upravljati rezervacijama

### Rute

#### Javne rute (bez autentifikacije)
- `/` - Početna stranica
- `/rezervacije` - Stranica za rezervaciju (guest booking)
- `/rezervacije/uspjeh` - Potvrda rezervacije

#### Zaštićene rute (samo za osoblje)
- `/admin/login` - Stranica za prijavu
- `/admin` - Admin dashboard (pregled rezervacija)
- `/admin/services` - Upravljanje uslugama (samo owner)
- `/admin/staff` - Upravljanje osobljem (samo owner)
- `/admin/settings` - Postavke (samo owner)

### API Endpoints

#### Auth endpoints
- `POST /api/auth/login` - Prijava
- `POST /api/auth/logout` - Odjava
- `GET /api/auth/session` - Provjera sesije

#### Admin endpoints (zahtijevaju autentifikaciju)
- `GET /api/admin/bookings` - Dohvati sve rezervacije
- `PATCH /api/admin/bookings` - Ažuriraj rezervaciju

#### Javni endpoints (bez autentifikacije)
- `GET /api/services` - Dohvati usluge
- `GET /api/availability` - Provjeri dostupnost
- `POST /api/book` - Kreiraj rezervaciju (guest)

## 5. Testiranje

### Lokalno testiranje

```bash
# Pokreni dev server
npm run dev

# Otvori browser
http://localhost:4321/admin/login
```

### Test scenariji

1. **Prijava kao owner**
   - Idi na `/admin/login`
   - Unesi email i password
   - Trebao bi biti preusmjeren na `/admin`
   - Vidi sve rezervacije

2. **Guest rezervacija**
   - Idi na `/` ili `/rezervacije`
   - Rezerviši termin bez prijave
   - Provjeri da rezervacija radi

3. **Odjava**
   - U admin panelu, klikni "Odjavi se"
   - Trebao bi biti preusmjeren na početnu

4. **Zaštita ruta**
   - Odjavi se
   - Pokušaj pristupiti `/admin`
   - Trebao bi biti preusmjeren na `/admin/login`

## 6. Row Level Security (RLS)

Sistem koristi Supabase RLS za zaštitu podataka na nivou baze:

### Staff Profiles
- **Owner** može sve (INSERT, SELECT, UPDATE, DELETE)
- **Staff** može vidjeti sve profile (SELECT)
- **Staff** može ažurirati svoj profil (UPDATE own)

### Bookings
- **Svi** mogu kreirati rezervacije (INSERT) - guest booking
- **Svi** mogu vidjeti rezervacije (SELECT) - ali filtriramo u aplikaciji
- **Staff** može ažurirati rezervacije (UPDATE)
- **Staff** može obrisati rezervacije (DELETE)

### Services
- **Svi** mogu vidjeti aktivne usluge (SELECT active)
- **Staff** može vidjeti sve usluge (SELECT)
- **Owner** može upravljati uslugama (INSERT, UPDATE, DELETE)

### Business Hours & Time Off
- **Svi** mogu vidjeti radno vrijeme i time-off (SELECT)
- **Owner** može upravljati radnim vremenom (INSERT, UPDATE, DELETE)
- **Staff** može upravljati time-off (INSERT, UPDATE, DELETE)

## 7. Dodavanje novog osoblja

### Kao Owner:

1. Prijavi se u admin panel
2. Idi na **Osoblje** tab (kada bude implementiran UI)
3. Klikni **Dodaj osoblje**
4. Unesi:
   - Email
   - Ime
   - Uloga (staff ili owner)
   - Inicijalna šifra
5. Novi član osoblja će dobiti email sa uputama

### Alternativno, kroz SQL:

```sql
-- Kreiranje novog staff člana
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'novi.zaposleni@example.com',
  crypt('InicijalnaSifra123!', gen_salt('bf')),
  NOW(),
  '{"role": "staff", "full_name": "Novo Ime"}',
  NOW(),
  NOW(),
  '',
  ''
);
```

## 8. Sigurnosne preporuke

1. **Jaka lozinka**: Koristi jaku lozinku od najmanje 12 karaktera
2. **Environment varijable**: Nikada ne komituj `.env` u git
3. **HTTPS**: U produkciji obavezno koristi HTTPS
4. **Service role key**: Čuvaj service_role key samo na serveru (ne koristi ga u klijentu)
5. **Email verification**: Omogući email verification u produkciji
6. **Password reset**: Omogući password reset funkcionalnost

## 9. Često postavljena pitanja

### Kako resetovati lozinku?

Za sada, owner mora resetovati kroz Supabase Dashboard:
1. Authentication > Users
2. Pronađi korisnika
3. Klikni **...** > **Reset Password**

### Kako deaktivirati korisnika?

```sql
UPDATE public.staff_profiles
SET active = false
WHERE email = 'korisnik@example.com';
```

### Kako promijenjivati uloge?

```sql
-- Promijeni staff u owner
UPDATE public.staff_profiles
SET role = 'owner'
WHERE email = 'korisnik@example.com';

-- Promijeni owner u staff
UPDATE public.staff_profiles
SET role = 'staff'
WHERE email = 'korisnik@example.com';
```

## 10. Troubleshooting

### "Missing Supabase environment variables"

**Rješenje:** Provjeri da su `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY` postavljeni u `.env` ili Vercel.

### "Niste autorizirani kao osoblje"

**Rješenje:** Provjeri da korisnik postoji u `staff_profiles` tabeli i da je `active = true`.

### "Policies preventing action"

**Rješenje:** Provjeri RLS policies u Supabase Dashboard > Database > Policies.

### "Session expired"

**Rješenje:** Odjavi se i prijavi ponovo. Session traje 7 dana po defaultu.

## 11. Dodatne informacije

- [Supabase Auth dokumentacija](https://supabase.com/docs/guides/auth)
- [Supabase RLS dokumentacija](https://supabase.com/docs/guides/auth/row-level-security)
- [Astro dokumentacija](https://docs.astro.build)

---

**Primjedba:** Ova implementacija omogućava sigurnu autentifikaciju za osoblje uz zadržavanje mogućnosti "guest booking" za kupce. Svi podaci su zaštićeni pomoću RLS policies na nivou baze podataka.

