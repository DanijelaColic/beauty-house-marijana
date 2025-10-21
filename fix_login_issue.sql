-- Fix za login problem: "Niste autorizirani kao osoblje"
-- Pokreni ovaj SQL u Supabase SQL Editor

-- =============================================
-- 1. PROVJERA POSTOJANJA TABLICE
-- =============================================

-- Provjeri da li staff_profiles tabela postoji
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'staff_profiles'
) as table_exists;

-- =============================================
-- 2. KREIRANJE STAFF_PROFILES TABLICE (ako ne postoji)
-- =============================================

-- Kreiraj enum tip ako ne postoji
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
    CREATE TYPE staff_role AS ENUM ('owner', 'staff');
  END IF;
END $$;

-- Kreiraj staff_profiles tabelu ako ne postoji
CREATE TABLE IF NOT EXISTS public.staff_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role staff_role DEFAULT 'staff',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. KREIRANJE TRIGGER-A ZA AUTO KREIRANJE PROFILA
-- =============================================

-- Funkcija za automatsko kreiranje staff profila
CREATE OR REPLACE FUNCTION public.handle_new_staff_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.staff_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::staff_role, 'staff')
  )
  ON CONFLICT (id) DO NOTHING; -- Ne briši ako već postoji
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kreiraj trigger ako ne postoji
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_staff_user();

-- =============================================
-- 4. RLS POLICIES
-- =============================================

-- Omogući RLS
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Obriši postojeće policies
DROP POLICY IF EXISTS "Owners can do everything on staff_profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can view all staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;

-- Kreiraj nove policies
CREATE POLICY "Owners can do everything on staff_profiles"
  ON public.staff_profiles
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE role = 'owner' AND active = true
    )
  );

CREATE POLICY "Staff can view all staff profiles"
  ON public.staff_profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.staff_profiles WHERE active = true
    )
  );

CREATE POLICY "Staff can update own profile"
  ON public.staff_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =============================================
-- 5. KREIRANJE ADMIN KORISNIKA
-- =============================================

-- Provjeri da li admin korisnik već postoji
DO $$
DECLARE
  admin_exists boolean;
  admin_id uuid;
BEGIN
  -- Provjeri da li postoji admin@beautyhouse.com
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = 'admin@beautyhouse.com'
  ) INTO admin_exists;
  
  IF NOT admin_exists THEN
    -- Kreiraj admin korisnika
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
      'admin@beautyhouse.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      '{"role": "owner", "full_name": "Marijana Talović"}',
      NOW(),
      NOW(),
      '',
      ''
    );
  END IF;
  
  -- Dohvati admin ID
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@beautyhouse.com';
  
  -- Kreiraj ili ažuriraj staff profil
  INSERT INTO public.staff_profiles (id, email, full_name, role, active)
  VALUES (admin_id, 'admin@beautyhouse.com', 'Marijana Talović', 'owner', true)
  ON CONFLICT (id) 
  DO UPDATE SET 
    role = 'owner',
    full_name = 'Marijana Talović',
    active = true,
    updated_at = NOW();
    
END $$;

-- =============================================
-- 6. PROVJERA REZULTATA
-- =============================================

-- Provjeri da li je sve u redu
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  sp.full_name,
  sp.role,
  sp.active,
  sp.created_at
FROM auth.users u
LEFT JOIN public.staff_profiles sp ON u.id = sp.id
WHERE u.email = 'admin@beautyhouse.com';

-- =============================================
-- 7. INDEKSI ZA PERFORMANSE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_staff_profiles_email ON public.staff_profiles(email);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_active ON public.staff_profiles(active);

-- =============================================
-- GOTOVO!
-- =============================================

-- Sada možeš testirati prijavu sa:
-- Email: admin@beautyhouse.com
-- Password: Admin123!
