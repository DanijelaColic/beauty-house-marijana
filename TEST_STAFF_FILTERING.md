# 🧪 Testiranje filtriranja rezervacija po djelatniku

## Korak 1: Provjeri distribuciju rezervacija

Pokreni `test_staff_filtering.sql` u Supabase SQL Editoru da vidiš:
- Koliko rezervacija ima svaki djelatnik
- Da li su sve rezervacije dodijeljene

## Korak 2: Testiranje kao Owner (Ana Marić)

1. **Odjavi se** iz admin sučelja
2. **Prijavi se** kao `ana.maric@beautyhouse.hr` / `Ana2024!`
3. **Otvori** `/admin` stranicu
4. **Provjeri:**
   - ✅ Trebao bi vidjeti **SVE** rezervacije (bez obzira na staff_id)
   - ✅ U browser console-u trebao bi vidjeti: `✅ Retrieved bookings: 7` (ili koliko ima ukupno)

## Korak 3: Testiranje kao Staff (npr. Petra Novak)

1. **Odjavi se** iz admin sučelja
2. **Prijavi se** kao `petra.novak@beautyhouse.hr` / `Petra2024!`
3. **Otvori** `/admin` stranicu
4. **Provjeri:**
   - ✅ Trebao bi vidjeti samo **SVOJE** rezervacije (gdje je `staff_id` = njen staff_profile id)
   - ✅ U browser console-u trebao bi vidjeti: `✅ Retrieved bookings: X` (gdje je X broj njenih rezervacija)
   - ✅ Ako nema dodijeljenih rezervacija, neće vidjeti ništa

## Korak 4: Provjeri RLS politike

Pokreni u Supabase SQL Editoru:

```sql
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'bookings'
AND cmd = 'SELECT'
ORDER BY policyname;
```

Trebao bi vidjeti:
- `Owner can view all bookings` - za owner-a
- `Staff can view own bookings` - za staff (samo svoje)

## Ako staff i dalje vidi sve rezervacije

Ako staff i dalje vidi sve rezervacije umjesto samo svojih, provjeri:

1. **Da li je pokrenuta `update_bookings_rls_for_staff.sql`?**
   - Ova skripta postavlja politiku da staff vidi samo svoje

2. **Da li je možda pokrenuta `fix_bookings_rls_simple.sql`?**
   - Ova skripta privremeno omogućuje staff-u da vidi sve (za debug)

3. **Pokreni ponovno `update_bookings_rls_for_staff.sql`** da osiguraš ispravne politike

## Ako staff ne vidi ništa

Ako staff ne vidi ništa (čak i kada ima dodijeljene rezervacije):

1. **Provjeri da li su rezervacije dodijeljene:**
```sql
SELECT 
  b.id,
  b.client_name,
  sp.full_name as assigned_staff
FROM public.bookings b
LEFT JOIN public.staff_profiles sp ON sp.id = b.staff_id
WHERE b.staff_id IS NOT NULL;
```

2. **Provjeri da li `get_staff_profile_id()` funkcija radi:**
```sql
-- Test kao authenticated user (zamijeni USER_ID sa stvarnim UUID-om)
SET ROLE authenticated;
SET request.jwt.claim.sub = 'USER_ID';

SELECT public.get_staff_profile_id();

RESET ROLE;
```

3. **Provjeri da li RLS politika koristi ispravnu logiku:**
```sql
SELECT 
  policyname,
  qual
FROM pg_policies
WHERE tablename = 'bookings'
AND policyname = 'Staff can view own bookings';
```

Trebao bi vidjeti: `(public.is_staff() = true AND staff_id = public.get_staff_profile_id())`

