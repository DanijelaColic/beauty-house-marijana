-- Supabase Auth Setup za osoblje (owner, staff)
-- Kopiraj i pokreni ovaj SQL kod u Supabase SQL Editor

-- =============================================
-- 1. KREIRAJ CUSTOM ENUM ZA ULOGE OSOBLJA
-- =============================================
CREATE TYPE staff_role AS ENUM ('owner', 'staff');

-- =============================================
-- 2. KREIRAJ TABELU ZA PROFILE OSOBLJA
-- =============================================
-- Ova tabela se povezuje sa auth.users
CREATE TABLE public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role staff_role DEFAULT 'staff',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. TRIGGER ZA AUTO KREIRANJE PROFILA
-- =============================================
-- Automatski kreira staff profil kada se kreira novi korisnik
CREATE OR REPLACE FUNCTION public.handle_new_staff_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.staff_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::staff_role, 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_staff_user();

-- =============================================
-- 4. TRIGGER ZA AUTO AŽURIRANJE UPDATED_AT
-- =============================================
CREATE TRIGGER update_staff_profiles_updated_at 
  BEFORE UPDATE ON public.staff_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 5. RLS (ROW LEVEL SECURITY) POLICIES
-- =============================================

-- Omogući RLS na staff_profiles
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Owner može sve
CREATE POLICY "Owners can do everything on staff_profiles"
  ON public.staff_profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE role = 'owner' AND active = true
    )
  );

-- Policy: Staff može vidjeti sve profile
CREATE POLICY "Staff can view all staff profiles"
  ON public.staff_profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

-- Policy: Staff može ažurirati svoj profil
CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.staff_profiles WHERE id = auth.uid()));

-- =============================================
-- 6. AŽURIRAJ BOOKINGS TABELU - RLS POLICIES
-- =============================================

-- Omogući RLS na bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu kreirati rezervacije (guest booking)
CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- Policy: Svi mogu vidjeti svoje rezervacije (po email-u)
CREATE POLICY "Anyone can view own bookings by email"
  ON public.bookings
  FOR SELECT
  USING (true); -- Public, ali ćemo filtrirati u aplikaciji

-- Policy: Osoblje može vidjeti sve rezervacije
CREATE POLICY "Staff can view all bookings"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

-- Policy: Osoblje može ažurirati rezervacije
CREATE POLICY "Staff can update bookings"
  ON public.bookings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

-- Policy: Osoblje može obrisati rezervacije
CREATE POLICY "Staff can delete bookings"
  ON public.bookings
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

-- =============================================
-- 7. SERVICES TABELA - RLS POLICIES
-- =============================================

-- Omogući RLS na services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu vidjeti aktivne usluge
CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (active = true);

-- Policy: Osoblje može vidjeti sve usluge
CREATE POLICY "Staff can view all services"
  ON public.services
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

-- Policy: Owner može upravljati uslugama
CREATE POLICY "Owners can manage services"
  ON public.services
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE role = 'owner' AND active = true
    )
  );

-- =============================================
-- 8. BUSINESS_HOURS TABELA - RLS POLICIES
-- =============================================

ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu vidjeti radno vrijeme
CREATE POLICY "Anyone can view business hours"
  ON public.business_hours
  FOR SELECT
  USING (true);

-- Policy: Owner može upravljati radnim vremenom
CREATE POLICY "Owners can manage business hours"
  ON public.business_hours
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE role = 'owner' AND active = true
    )
  );

-- =============================================
-- 9. TIME_OFF TABELA - RLS POLICIES
-- =============================================

ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;

-- Policy: Svi mogu vidjeti aktivne time-off periode
CREATE POLICY "Anyone can view active time off"
  ON public.time_off
  FOR SELECT
  USING (active = true);

-- Policy: Osoblje može upravljati time-off
CREATE POLICY "Staff can manage time off"
  ON public.time_off
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

-- =============================================
-- 10. FUNKCIJE ZA PROVJERU ULOGA
-- =============================================

-- Funkcija za provjeru da li je korisnik owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND role = 'owner' AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcija za provjeru da li je korisnik staff (bilo koja uloga)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE id = auth.uid() AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcija za dohvaćanje trenutne uloge
CREATE OR REPLACE FUNCTION public.get_staff_role()
RETURNS staff_role AS $$
DECLARE
  user_role staff_role;
BEGIN
  SELECT role INTO user_role
  FROM public.staff_profiles
  WHERE id = auth.uid() AND active = true;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 11. INICIJALNI OWNER ACCOUNT (IZMIJENI EMAIL!)
-- =============================================
-- NAPOMENA: Nakon što ovaj SQL bude pokrenut, moraš:
-- 1. Ići u Supabase Dashboard > Authentication > Users
-- 2. Kliknuti "Add user" > "Create new user"
-- 3. Unijeti email i password za owner-a
-- 4. Nakon kreiranja, kopirati USER_ID i pokrenuti:
-- 
-- UPDATE public.staff_profiles
-- SET role = 'owner'
-- WHERE id = 'USER_ID_OVDJE';
--
-- Alternativno, možeš kreirati korisnika direktno kroz SQL:
-- (Zamijeni 'owner@example.com' i 'your-secure-password')

-- NAPOMENA: Ovo je primjer - koristi stvarni email i jak password!
-- Nakon registracije, ne zaboravi verificirati email u Supabase dashboard-u

-- =============================================
-- 12. INDEKSI ZA PERFORMANSE
-- =============================================

CREATE INDEX idx_staff_profiles_email ON public.staff_profiles(email);
CREATE INDEX idx_staff_profiles_role ON public.staff_profiles(role);
CREATE INDEX idx_staff_profiles_active ON public.staff_profiles(active);

-- =============================================
-- GOTOVO! 
-- =============================================
-- Sada možeš kreirati prvog owner korisnika kroz:
-- Supabase Dashboard > Authentication > Add user
--
-- Ili kroz SQL (zamijeni email i password):
/*
-- Primjer kreiranja prvog owner korisnika (OPCIONO)
-- NEMOJ koristiti ovaj email i password u produkciji!

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'owner@beautyhouse.com', -- PROMIJENI!
  crypt('ChangeMe123!', gen_salt('bf')), -- PROMIJENI PASSWORD!
  NOW(),
  '{"role": "owner", "full_name": "Marijana Vlasnik"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- Onda ažuriraj profil:
UPDATE public.staff_profiles
SET role = 'owner'
WHERE email = 'owner@beautyhouse.com';
*/

