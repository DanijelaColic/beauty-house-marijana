# 📋 Sažetak implementacije filtriranja rezervacija po djelatniku

## ✅ Što je urađeno

### 1. SQL Skripte
- ✅ `update_bookings_rls_for_staff.sql` - Dodaje `staff_id` kolonu i ažurira RLS politike
- ✅ `add_staff_id_to_bookings.sql` - Alternativna skripta za dodavanje kolone

### 2. RLS Politike
- ✅ **Owner** vidi **SVE** rezervacije (`is_owner() = true`)
- ✅ **Staff** vidi samo **SVOJE** rezervacije (`staff_id = get_staff_profile_id()`)
- ✅ Helper funkcija `get_staff_profile_id()` vraća staff_profile id iz auth.uid()

### 3. TypeScript Tipovi
- ✅ Dodano `staffId?: string` u `Booking` interface
- ✅ Dodano `staff?: StaffProfile` u `Booking` interface

### 4. Kod Ažuriranja
- ✅ `formatBooking()` sada formatira `staffId` i `staff` podatke
- ✅ `getBookings()` SELECT query uključuje `staff:staff_profiles(*)` join
- ✅ `getBookingById()` SELECT query uključuje `staff:staff_profiles(*)` join
- ✅ `updateBooking()` SELECT query uključuje `staff:staff_profiles(*)` join
- ✅ `createBooking()` sada prihvaća `staffId` parametar i postavlja ga u bazu

## 📝 Što trebaš napraviti

### Korak 1: Pokreni SQL skriptu
U Supabase SQL Editor pokreni:
```sql
-- Kopiraj i pokreni sadržaj iz update_bookings_rls_for_staff.sql
```

Ova skripta će:
1. Dodati `staff_id` kolonu u `bookings` tablicu (ako ne postoji)
2. Kreirati helper funkciju `get_staff_profile_id()`
3. Obrisati stare RLS politike
4. Kreirati nove RLS politike:
   - Owner vidi sve rezervacije
   - Staff vidi samo svoje rezervacije

### Korak 2: Testiranje

1. **Test kao Owner (Ana Marić):**
   - Prijavi se kao `ana.maric@beautyhouse.hr`
   - Trebao bi vidjeti **SVE** rezervacije

2. **Test kao Staff (npr. Petra Novak):**
   - Prijavi se kao `petra.novak@beautyhouse.hr`
   - Trebao bi vidjeti samo rezervacije gdje je `staff_id` = njen staff_profile id
   - Ako nema rezervacija dodijeljenih njoj, neće vidjeti ništa

### Korak 3: Dodjela postojećih rezervacija (opcionalno)

Ako imaš postojeće rezervacije u bazi i želiš ih dodijeliti djelatnicima:

```sql
-- Dodijeli sve postojeće rezervacije owner-u (Ana Marić)
-- Zamijeni 'ANA_MARIC_STAFF_PROFILE_ID' sa stvarnim ID-om iz staff_profiles tablice
UPDATE public.bookings
SET staff_id = 'ANA_MARIC_STAFF_PROFILE_ID'
WHERE staff_id IS NULL;
```

Ili ručno dodijeli svaku rezervaciju određenom djelatniku.

## 🔍 Kako funkcionira

### RLS Politike automatski filtriraju:

1. **Kada Owner (Ana Marić) učita rezervacije:**
   - RLS provjerava: `is_owner() = true` → ✅ Vidi sve rezervacije

2. **Kada Staff (npr. Petra Novak) učita rezervacije:**
   - RLS provjerava: `staff_id = get_staff_profile_id()`
   - `get_staff_profile_id()` vraća ID Petra's staff_profile
   - Vidi samo rezervacije gdje je `staff_id` = njen ID

### API Route (`/api/admin/bookings`):
- Koristi `requireAuth()` koji vraća `session.profile.id` (staff_profile id)
- Koristi `createAuthenticatedSupabaseClient()` koji automatski primjenjuje RLS politike
- **Ne treba** dodatno filtriranje u kodu - RLS to radi automatski!

## 🎯 Rezultat

- ✅ Owner vidi sve rezervacije
- ✅ Staff vidi samo svoje rezervacije
- ✅ RLS politike osiguravaju sigurnost na nivou baze
- ✅ Kod je jednostavniji jer ne treba manualno filtrirati

## 📌 Napomene

- **Nove rezervacije:** Kada se kreira nova rezervacija kroz `/api/book`, možeš proslijediti `staffId` parametar da se rezervacija automatski dodijeli određenom djelatniku
- **Postojeće rezervacije:** Ako rezervacija nema `staff_id`, bit će vidljiva samo Owner-u
- **Guest booking:** Rezervacije kreirane bez `staffId` će imati `staff_id = NULL` i bit će vidljive samo Owner-u

