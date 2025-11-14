# ✅ Checklist za završnu konfiguraciju

Nakon što si promijenila Supabase projekt, provjeri sljedeće:

## 1. ✅ SQL Skripte koje si već pokrenula

- [x] `bookings_rls_fix.sql` - RLS politike za bookings tablicu

## 2. 🔲 SQL Skripte koje još trebaš pokrenuti

### Pokreni `staff_profiles_rls_fix.sql`
**VAŽNO:** Ova skripta je potrebna za login funkcionalnost!

U Supabase Dashboard → SQL Editor pokreni:
```sql
-- Kopiraj i pokreni sadržaj iz staff_profiles_rls_fix.sql
```

Ova skripta će:
- Omogućiti korisnicima da vide svoj profil (potrebno za login)
- Omogućiti staff-u da vidi sve profile
- Omogućiti owner-u upravljanje profilima

## 3. 🔲 Environment Varijable

Ako si promijenila Supabase projekt, provjeri da li su environment varijable ažurirane:

### Lokalno (.env file)
Provjeri ili kreiraj `.env` file u root direktoriju:
```env
PUBLIC_SUPABASE_URL=https://tvoj-novi-projekt.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tvoj-novi-anon-key
```

### Kako pronaći Supabase credentials:
1. Idi u Supabase Dashboard → tvoj projekt
2. Settings → API
3. Kopiraj:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon public** key → `PUBLIC_SUPABASE_ANON_KEY`

### Nakon promjene environment varijabli:
```bash
# Restart dev server
# Ctrl+C za zaustaviti, zatim:
npm run dev
```

## 4. 🔲 Provjeri da li postoje osnovne tablice

U Supabase Dashboard → Table Editor provjeri da postoje:

- [ ] `bookings` - tablica za rezervacije
- [ ] `staff_profiles` - tablica za osoblje
- [ ] `services` - tablica za usluge (opcionalno, možeš koristiti mock)

## 5. 🔲 Provjeri RLS Politike

U Supabase Dashboard → Database → Policies provjeri:

### Bookings tablica:
- [ ] "Anyone can insert bookings" (INSERT)
- [ ] "Staff can view all bookings" (SELECT)
- [ ] "Staff can update bookings" (UPDATE)
- [ ] "Staff can delete bookings" (DELETE)

### Staff_profiles tablica:
- [ ] "Users can view their own profile" (SELECT)
- [ ] "Staff can view all profiles" (SELECT)
- [ ] "Users can update their own profile" (UPDATE)
- [ ] "Owner can manage all profiles" (ALL)

## 6. 🔲 Testiranje

### Test 1: Login
1. Idi na `/admin/login`
2. Prijavi se s admin credentials
3. Trebao bi se redirektirati na `/admin`

### Test 2: Rezervacije
1. Nakon login-a, trebao bi vidjeti listu rezervacija
2. Ako vidiš "Nema rezervacija", provjeri:
   - Da li postoje rezervacije u `bookings` tablici
   - Da li RLS politike dozvoljavaju pristup

### Test 3: Kreiranje rezervacije
1. Idi na `/rezervacije` (bez login-a)
2. Kreiraj test rezervaciju
3. Provjeri da se rezervacija pojavila u bazi
4. Refresh admin stranicu - trebala bi se pojaviti

## 7. 🔲 Ako i dalje ne vidiš rezervacije

### Provjeri u browser console (F12):
```javascript
// Trebao bi vidjeti:
📋 Loading bookings...
📡 Bookings response status: 200 OK
📦 Bookings response data: { success: true, bookingsCount: X }
```

### Provjeri u server terminalu:
```bash
# Trebao bi vidjeti:
📋 GET /api/admin/bookings - Starting...
✅ Retrieved bookings: X
```

### Ako vidiš grešku:
- **"new row violates row-level security policy"** → Provjeri RLS politike
- **"relation does not exist"** → Provjeri da tablice postoje
- **"permission denied"** → Provjeri RLS politike i helper funkcije

## 8. ✅ Finalna provjera

- [ ] Login radi
- [ ] Rezervacije se vide u admin sučelju
- [ ] Rezervacije se mogu kreirati (guest booking)
- [ ] Rezervacije se mogu ažurirati (promjena statusa)

---

**Ako sve radi:** Možeš ukloniti debug alert iz LoginForm.tsx (već je uklonjen) i sve je spremno! 🎉

