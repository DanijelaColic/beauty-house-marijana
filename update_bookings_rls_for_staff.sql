-- SQL skripta za ažuriranje RLS politika za bookings tablicu
-- Staff će vidjeti samo svoje rezervacije, owner će vidjeti sve

-- Prvo, provjerimo da li staff_id kolona postoji
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
    
    CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON public.bookings(staff_id);
    
    RAISE NOTICE 'Kolona staff_id je uspješno dodana u bookings tablicu';
  ELSE
    RAISE NOTICE 'Kolona staff_id već postoji u bookings tablici';
  END IF;
END $$;

-- Helper funkcija za dobivanje staff_profile_id iz auth.uid()
CREATE OR REPLACE FUNCTION public.get_staff_profile_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.staff_profiles 
    WHERE user_id = auth.uid() 
    AND active = true
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Policy 3: Staff može vidjeti samo svoje rezervacije
CREATE POLICY "Staff can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  public.is_staff() = true 
  AND staff_id = public.get_staff_profile_id()
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
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

