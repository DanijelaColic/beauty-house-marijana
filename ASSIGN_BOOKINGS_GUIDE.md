# 📋 Vodič za dodjelu rezervacija djelatnicima

## Pregled

Nakon što si pokrenula `update_bookings_rls_for_staff.sql`, sada trebaš dodijeliti postojeće rezervacije djelatnicima postavljanjem `staff_id` kolone.

## Korak 1: Provjeri postojeće rezervacije

Pokreni u Supabase SQL Editoru:

```sql
-- Provjeri koliko rezervacija nema staff_id
SELECT 
  COUNT(*) as total_bookings,
  COUNT(staff_id) as bookings_with_staff,
  COUNT(*) - COUNT(staff_id) as bookings_without_staff
FROM public.bookings;

-- Prikaži sve rezervacije bez staff_id
SELECT 
  id,
  client_name,
  client_email,
  start_at,
  status,
  staff_id
FROM public.bookings
WHERE staff_id IS NULL
ORDER BY start_at DESC;
```

## Korak 2: Provjeri dostupne djelatnike

```sql
SELECT 
  id,
  full_name,
  email,
  role,
  active
FROM public.staff_profiles
WHERE active = true
ORDER BY role DESC, full_name;
```

**VAŽNO:** Kopiraj `id` (UUID) za svakog djelatnika - trebat će ti za dodjelu.

## Korak 3: Odaberi način dodjele

### Opcija A: Dodijeli sve Owner-u (Ana Marić) - NAJBRŽE

1. Pronađi Ana Marić `id` iz Koraka 2
2. Pokreni:

```sql
UPDATE public.bookings
SET staff_id = 'ANA_MARIC_STAFF_PROFILE_ID'  -- Zamijeni sa stvarnim UUID-om
WHERE staff_id IS NULL;
```

### Opcija B: Automatska distribucija po rotaciji

Pokreni `assign_bookings_to_staff.sql` skriptu - automatski će distribuirati rezervacije među svim aktivnim djelatnicima po rotaciji.

**Prednosti:**
- Brzo i automatsko
- Ravnomjerna distribucija

**Nedostaci:**
- Ne uzima u obzir specifične usluge ili vještine djelatnika

### Opcija C: Ručna dodjela (najpreciznije)

Za svaku rezervaciju ručno odaberi djelatnika:

```sql
-- Primjer: Dodijeli rezervaciju određenom djelatniku
UPDATE public.bookings
SET staff_id = 'STAFF_PROFILE_ID'  -- UUID djelatnika
WHERE id = 'BOOKING_ID';            -- UUID rezervacije
```

**Prednosti:**
- Potpuna kontrola
- Možeš uzimati u obzir vještine djelatnika

**Nedostaci:**
- Sporo za veliki broj rezervacija

## Korak 4: Provjeri rezultate

Nakon dodjele, provjeri distribuciju:

```sql
-- Koliko rezervacija ima svaki djelatnik
SELECT 
  sp.full_name as staff_name,
  sp.role,
  COUNT(b.id) as booking_count
FROM public.staff_profiles sp
LEFT JOIN public.bookings b ON b.staff_id = sp.id
WHERE sp.active = true
GROUP BY sp.id, sp.full_name, sp.role
ORDER BY sp.role DESC, sp.full_name;
```

## Nakon dodjele

1. **Testiraj kao Owner (Ana Marić):**
   - Trebao bi vidjeti **SVE** rezervacije (bez obzira na staff_id)

2. **Testiraj kao Staff (npr. Petra Novak):**
   - Trebao bi vidjeti samo rezervacije gdje je `staff_id` = njen staff_profile id
   - Ako nema dodijeljenih rezervacija, neće vidjeti ništa

## Napomene

- **Nove rezervacije:** Kada se kreira nova rezervacija kroz `/api/book`, možeš proslijediti `staffId` parametar da se automatski dodijeli određenom djelatniku
- **Rezervacije bez staff_id:** Ako rezervacija nema `staff_id`, bit će vidljiva samo Owner-u
- **Promjena dodjele:** Možeš promijeniti `staff_id` bilo koje rezervacije u bilo kojem trenutku

