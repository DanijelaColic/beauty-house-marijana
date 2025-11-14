-- SQL skripta za popravljanje RLS politika za bookings tablicu
-- Koristi jednostavnije politike koje će sigurno raditi

-- Obriši postojeće politike
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can update all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Owner can delete all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can delete own bookings" ON public.bookings;

-- Policy 1: Svi mogu kreirati rezervacije (guest booking)
CREATE POLICY "Anyone can insert bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Owner može vidjeti SVE rezervacije
CREATE POLICY "Owner can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.is_owner() = true
);

-- Policy 3: Staff može vidjeti sve rezervacije (privremeno, dok se ne postave staff_id na postojeće rezervacije)
-- Kasnije možemo promijeniti da vidi samo svoje: staff_id = public.get_staff_profile_id()
CREATE POLICY "Staff can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.is_staff() = true
);

-- Policy 4: Owner može ažurirati sve rezervacije
CREATE POLICY "Owner can update all bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  public.is_owner() = true
)
WITH CHECK (
  public.is_owner() = true
);

-- Policy 5: Staff može ažurirati samo svoje rezervacije
CREATE POLICY "Staff can update own bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  public.is_staff() = true 
  AND staff_id = public.get_staff_profile_id()
)
WITH CHECK (
  public.is_staff() = true 
  AND staff_id = public.get_staff_profile_id()
);

-- Policy 6: Owner može obrisati sve rezervacije
CREATE POLICY "Owner can delete all bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  public.is_owner() = true
);

-- Policy 7: Staff može obrisati samo svoje rezervacije
CREATE POLICY "Staff can delete own bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  public.is_staff() = true 
  AND staff_id = public.get_staff_profile_id()
);

-- Provjera da li su politike uspješno kreirane
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

