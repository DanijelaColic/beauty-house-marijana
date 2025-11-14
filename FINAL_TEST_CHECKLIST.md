# ✅ Finalni test checklist

## Korak 1: Provjeri distribuciju rezervacija

Pokreni `test_staff_filtering.sql` u Supabase SQL Editoru.

**Očekivani rezultat:**
- Svaki djelatnik ima barem neke rezervacije (ili 0 ako nema dodijeljenih)
- Owner (Ana Marić) možda ima više rezervacija

## Korak 2: Test kao Owner (Ana Marić)

1. Odjavi se iz admin sučelja
2. Prijavi se kao:
   - Email: `ana.maric@beautyhouse.hr`
   - Lozinka: `Ana2024!`
3. Otvori `/admin` stranicu
4. **Očekivani rezultat:**
   - ✅ Vidi **SVE** rezervacije (7 ili koliko ima ukupno)
   - ✅ U browser console: `✅ Retrieved bookings: 7`
   - ✅ U server terminal: `✅ Retrieved bookings: 7`

## Korak 3: Test kao Staff (Petra Novak)

1. Odjavi se iz admin sučelja
2. Prijavi se kao:
   - Email: `petra.novak@beautyhouse.hr`
   - Lozinka: `Petra2024!`
3. Otvori `/admin` stranicu
4. **Očekivani rezultat:**
   - ✅ Vidi samo **SVOJE** rezervacije (gdje je `staff_id` = njen staff_profile id)
   - ✅ U browser console: `✅ Retrieved bookings: X` (gdje je X broj njenih rezervacija)
   - ✅ U server terminal: `✅ Retrieved bookings: X`
   - ✅ Ako nema dodijeljenih rezervacija, vidi "Nema rezervacija"

## Korak 4: Test kao Staff (Marija Kovač)

1. Odjavi se
2. Prijavi se kao:
   - Email: `marija.kovac@beautyhouse.hr`
   - Lozinka: `Marija2024!`
3. Otvori `/admin` stranicu
4. **Očekivani rezultat:**
   - ✅ Vidi samo **SVOJE** rezervacije
   - ✅ Broj rezervacija se razlikuje od Petra's rezervacija (različita distribucija)

## Ako nešto ne radi

### Problem: Staff i dalje vidi sve rezervacije

**Rješenje:** Provjeri da li je pokrenuta `update_bookings_rls_for_staff.sql` (ne `fix_bookings_rls_simple.sql`)

Pokreni ponovno:
```sql
-- Provjeri postojeće politike
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'bookings' 
AND policyname = 'Staff can view own bookings';

-- Trebao bi vidjeti: (public.is_staff() = true AND staff_id = public.get_staff_profile_id())
```

### Problem: Staff ne vidi ništa (čak i kada ima dodijeljene rezervacije)

**Rješenje:** Provjeri da li `get_staff_profile_id()` funkcija radi:

```sql
-- Provjeri da li funkcija postoji
SELECT proname, pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname = 'get_staff_profile_id';
```

### Problem: Greška "function get_staff_profile_id() does not exist"

**Rješenje:** Pokreni ponovno `update_bookings_rls_for_staff.sql` - ta skripta kreira funkciju.

## ✅ Sve radi kada:

- ✅ Owner vidi sve rezervacije
- ✅ Staff vidi samo svoje rezervacije
- ✅ Broj rezervacija se razlikuje između različitih staff članova
- ✅ Nema grešaka u browser console-u ili server terminalu

