-- RLS Policies za staff_profiles tablicu
-- Ova skripta osigurava da authenticated korisnici mogu čitati svoje profile

-- Prvo, provjerimo da li RLS je omogućen
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Brisanje postojećih politika ako postoje (opcionalno, samo ako želiš resetirati)
-- DROP POLICY IF EXISTS "Users can view their own profile" ON public.staff_profiles;
-- DROP POLICY IF EXISTS "Staff can view all profiles" ON public.staff_profiles;
-- DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff_profiles;
-- DROP POLICY IF EXISTS "Owner can manage all profiles" ON public.staff_profiles;

-- Helper funkcija za provjeru da li je korisnik staff
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

-- Policy 1: Korisnici mogu vidjeti svoj vlastiti profil
-- Koristi DROP IF EXISTS da izbjegne grešku ako već postoji
DROP POLICY IF EXISTS "Users can view their own profile" ON public.staff_profiles;
CREATE POLICY "Users can view their own profile"
ON public.staff_profiles
FOR SELECT
TO public
USING (
  user_id = auth.uid()
);

-- Policy 2: Staff i owner mogu vidjeti sve profile (za admin panel)
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.staff_profiles;
CREATE POLICY "Staff can view all profiles"
ON public.staff_profiles
FOR SELECT
TO public
USING (
  public.is_staff() = true OR public.is_owner() = true
);

-- Policy 3: Korisnici mogu ažurirati svoj vlastiti profil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.staff_profiles;
CREATE POLICY "Users can update their own profile"
ON public.staff_profiles
FOR UPDATE
TO public
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);

-- Policy 4: Owner može upravljati svim profilima
DROP POLICY IF EXISTS "Owner can manage all profiles" ON public.staff_profiles;
CREATE POLICY "Owner can manage all profiles"
ON public.staff_profiles
FOR ALL
TO public
USING (
  public.is_owner() = true
)
WITH CHECK (
  public.is_owner() = true
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
WHERE tablename = 'staff_profiles'
ORDER BY policyname;

