-- Skripta za popravljanje postojećih bookings RLS politika
-- Ova skripta će ažurirati postojeće politike da koriste authenticated role umjesto public

-- Prvo, obriši postojeće politike koje imaju pogrešne postavke
DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can read own bookings" ON public.bookings;

-- Provjeri da li helper funkcije postoje, ako ne kreiraj ih
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.staff_profiles 
    WHERE user_id = auth.uid() 
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.staff_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'owner'
    AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kreiraj ispravne politike s authenticated role
-- Policy 1: Staff i owner mogu vidjeti SVE rezervacije (SAMO authenticated korisnici)
CREATE POLICY "Staff can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.is_staff() = true OR public.is_owner() = true
);

-- Policy 2: Staff i owner mogu ažurirati rezervacije
CREATE POLICY "Staff can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  public.is_staff() = true OR public.is_owner() = true
)
WITH CHECK (
  public.is_staff() = true OR public.is_owner() = true
);

-- Policy 3: Staff i owner mogu obrisati rezervacije
CREATE POLICY "Staff can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
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
ORDER BY policyname;

