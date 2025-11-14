-- SQL skripta za popravljanje RLS INSERT politike za bookings tablicu
-- Omogućava staff i owner da kreiraju rezervacije za bilo koga

-- Obriši postojeću INSERT politiku
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;

-- Policy 1: Svi mogu kreirati rezervacije (guest booking bez staff_id)
CREATE POLICY "Anyone can insert bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Authenticated staff i owner mogu kreirati rezervacije za bilo koga
-- Ova politika omogućava staff/owner da kreiraju rezervacije s bilo kojim staff_id
CREATE POLICY "Staff can insert bookings for anyone"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
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
AND cmd = 'INSERT'
ORDER BY policyname;

