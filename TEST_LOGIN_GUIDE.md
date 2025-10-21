# Test Login Upute za Beauty House Marijana

## 🧪 Test Korisnici

Nakon pokretanja `test_users_setup.sql` u Supabase SQL Editor, imaš dva test korisnika:

### 👑 Administrator (Owner)
- **Email:** `admin@beautyhouse.com`
- **Password:** `Admin123!`
- **Uloga:** `owner`
- **Pristup:** Svi admin paneli, upravljanje osobljem, uslugama, postavkama

### 👤 Djelatnik (Staff)
- **Email:** `djelatnik@beautyhouse.com`
- **Password:** `Staff123!`
- **Uloga:** `staff`
- **Pristup:** Pregled i upravljanje rezervacijama

## 🚀 Kako testirati

### 1. Lokalno testiranje

```bash
# Pokreni dev server
npm run dev

# Otvori browser
http://localhost:4321/admin/login
```

### 2. Test scenariji

#### Test Administrator prijave:
1. Idi na `/admin/login`
2. Unesi:
   - Email: `admin@beautyhouse.com`
   - Password: `Admin123!`
3. Trebao bi biti preusmjeren na `/admin`
4. Vidi admin dashboard sa svim rezervacijama
5. Provjeri da vidiš sve opcije (kada budu implementirane)

#### Test Djelatnik prijave:
1. Idi na `/admin/login`
2. Unesi:
   - Email: `djelatnik@beautyhouse.com`
   - Password: `Staff123!`
3. Trebao bi biti preusmjeren na `/admin`
4. Vidi admin dashboard sa rezervacijama
5. Provjeri da vidiš samo rezervacije (ne postavke)

#### Test Guest rezervacije:
1. Idi na `/` (početna stranica)
2. Klikni "Rezervacija" ili idi na `/rezervacije`
3. Rezerviši termin bez prijave
4. Provjeri da rezervacija radi normalno

#### Test zaštite ruta:
1. Odjavi se iz admin panela
2. Pokušaj pristupiti `/admin` direktno
3. Trebao bi biti preusmjeren na `/admin/login`

## 🔧 Setup koraci

### 1. Pokreni SQL skripte

```sql
-- 1. Prvo pokreni osnovnu shemu (ako već nisi)
-- supabase_setup.sql

-- 2. Zatim pokreni auth shemu
-- supabase_auth_setup.sql

-- 3. Na kraju pokreni test korisnike
-- test_users_setup.sql
```

### 2. Provjeri environment varijable

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Testiraj API endpoints

```bash
# Test prijave
curl -X POST http://localhost:4321/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@beautyhouse.com","password":"Admin123!"}'

# Test sesije
curl http://localhost:4321/api/auth/session

# Test odjave
curl -X POST http://localhost:4321/api/auth/logout
```

## 🐛 Troubleshooting

### "Niste autorizirani kao osoblje"
- Provjeri da je korisnik kreiran u `staff_profiles` tabeli
- Provjeri da je `active = true`

### "Invalid login credentials"
- Provjeri da je korisnik kreiran u `auth.users`
- Provjeri da je `email_confirmed_at` postavljen

### "Missing Supabase environment variables"
- Provjeri da su environment varijable postavljene
- Restartaj dev server nakon dodavanja env varijabli

### "Policies preventing action"
- Provjeri da su RLS policies aktivne
- Provjeri da korisnik ima odgovarajuću ulogu

## 🧹 Čišćenje test podataka

Ako želiš obrisati test korisnike:

```sql
-- Obriši test korisnike
DELETE FROM public.staff_profiles 
WHERE email IN ('admin@beautyhouse.com', 'djelatnik@beautyhouse.com');

DELETE FROM auth.users 
WHERE email IN ('admin@beautyhouse.com', 'djelatnik@beautyhouse.com');
```

## 📝 Napomene

- Test korisnici su kreirani sa fiksnim UUID-ovima za lakše testiranje
- Lozinke su jake ali jednostavne za testiranje
- U produkciji, koristi stvarne email adrese i jake lozinke
- Test korisnici su automatski aktivni (`active = true`)

## 🎯 Sljedeći koraci

1. **Testiraj prijavu** sa oba test korisnika
2. **Testiraj guest rezervaciju** da provjeriš da radi bez prijave
3. **Testiraj zaštitu ruta** - pokušaj pristupiti `/admin` bez prijave
4. **Testiraj odjavu** - provjeri da se korisnik odjavi ispravno
5. **Testiraj sesiju** - refresh stranice i provjeri da ostaneš prijavljen

---

**Sretno testiranje!** 🚀
