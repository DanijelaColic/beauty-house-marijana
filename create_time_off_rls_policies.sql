-- RLS Policies za time_off tablicu
-- Ova skripta osigurava da owner može upravljati slobodnim danima

-- Prvo, provjerimo da li RLS je omogućen
ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;

-- Brisanje postojećih politika ako postoje
DROP POLICY IF EXISTS "Public can view active time off" ON public.time_off;
DROP POLICY IF EXISTS "Public can read time off" ON public.time_off;
DROP POLICY IF EXISTS "Owner can manage time off" ON public.time_off;
DROP POLICY IF EXISTS "Staff can manage time off" ON public.time_off;
DROP POLICY IF EXISTS "Owner can view all time off" ON public.time_off;
DROP POLICY IF EXISTS "Owner can insert time off" ON public.time_off;
DROP POLICY IF EXISTS "Owner can update time off" ON public.time_off;
DROP POLICY IF EXISTS "Owner can delete time off" ON public.time_off;

-- Helper funkcija za provjeru da li je korisnik owner (ako već ne postoji)
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

-- Helper funkcija za provjeru da li je korisnik staff (ako već ne postoji)
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

-- Policy 1: Svi mogu vidjeti aktivne time-off (za availability provjere)
CREATE POLICY "Public can view active time off"
ON public.time_off
FOR SELECT
TO public
USING (active = true);

-- Policy 2: Owner može vidjeti sve time-off (uključujući neaktivne)
CREATE POLICY "Owner can view all time off"
ON public.time_off
FOR SELECT
TO authenticated
USING (public.is_owner() = true);

-- Policy 3: Owner može kreirati time-off (globalni ili individualni za bilo kojeg djelatnika)
CREATE POLICY "Owner can insert time off"
ON public.time_off
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_owner() = true
  AND (
    staff_id IS NULL 
    OR staff_id IN (SELECT id FROM public.staff_profiles WHERE active = true)
  )
);

-- Policy 4: Owner može ažurirati time-off
CREATE POLICY "Owner can update time off"
ON public.time_off
FOR UPDATE
TO authenticated
USING (public.is_owner() = true)
WITH CHECK (public.is_owner() = true);

-- Policy 5: Owner može obrisati time-off
CREATE POLICY "Owner can delete time off"
ON public.time_off
FOR DELETE
TO authenticated
USING (public.is_owner() = true);

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
WHERE tablename = 'time_off'
ORDER BY policyname;

