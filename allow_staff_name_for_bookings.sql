-- RLS Policy za dozvoljavanje anonimnim korisnicima da vide osnovne podatke iz staff_profiles
-- Ovo je potrebno za email potvrde rezervacija gdje treba prikazati ime djelatnika
-- 
-- INSTRUKCIJE:
-- 1. Pokreni ovu skriptu u Supabase SQL Editoru
-- 2. Ova politika će omogućiti anonimnim korisnicima da vide full_name iz staff_profiles
--    za aktivne djelatnike, što je potrebno za email potvrde rezervacija

-- Policy: Anonimni korisnici mogu vidjeti osnovne podatke iz staff_profiles za aktivne djelatnike
-- Ovo je potrebno za email potvrde rezervacija gdje treba prikazati ime djelatnika
DROP POLICY IF EXISTS "Public can view staff names for bookings" ON public.staff_profiles;
CREATE POLICY "Public can view staff names for bookings"
ON public.staff_profiles
FOR SELECT
TO public
USING (
  active = true
);

-- Provjera da li je politika uspješno kreirana
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'staff_profiles'
  AND policyname = 'Public can view staff names for bookings';

