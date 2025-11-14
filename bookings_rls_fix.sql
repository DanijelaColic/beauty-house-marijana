-- RLS Policies za bookings tablicu
-- Ova skripta osigurava da osoblje (staff) može vidjeti i upravljati rezervacijama

-- Prvo, provjerimo da li RLS je omogućen
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Brisanje postojećih politika ako postoje (koristi DROP IF EXISTS da izbjegne greške)
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can delete bookings" ON public.bookings;
DROP POLICY IF EXISTS "Authenticated can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public can read own bookings" ON public.bookings;

-- Helper funkcija za provjeru da li je korisnik staff
-- (Ova funkcija bi trebala već postojati iz supabase_auth_setup.sql)
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

-- Helper funkcija za provjeru da li je korisnik owner
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

-- Policy 1: Svi mogu kreirati rezervacije (guest booking)
CREATE POLICY "Anyone can insert bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Staff i owner mogu vidjeti SVE rezervacije
-- Koristi authenticated role za bolju sigurnost
CREATE POLICY "Staff can view all bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  -- Omogući ako je korisnik authenticated staff ili owner
  public.is_staff() = true OR public.is_owner() = true
);

-- Policy 3: Staff i owner mogu ažurirati rezervacije
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

-- Policy 4: Staff i owner mogu obrisati rezervacije
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

