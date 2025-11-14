-- SQL skripta za popravljanje RLS SELECT politike za bookings tablicu
-- Omogućava staff da vidi sve rezervacije (budući da mogu kreirati za bilo koga)

-- Obriši postojeće SELECT politike za staff
DROP POLICY IF EXISTS "Staff can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;

-- Policy: Staff može vidjeti sve rezervacije (budući da mogu kreirati za bilo koga)
-- Owner i dalje vidi sve rezervacije kroz svoju politiku
CREATE POLICY "Staff can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  -- Omogući ako je korisnik authenticated staff ili owner
  public.is_staff() = true OR public.is_owner() = true
);

-- Provjera da li su politike uspješno kreirane
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings'
AND cmd = 'SELECT'
ORDER BY policyname;

