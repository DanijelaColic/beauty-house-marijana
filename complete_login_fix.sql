-- Complete fix for login issue: "Niste autorizirani kao osoblje"
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. ENSURE STAFF_ROLE ENUM EXISTS
-- =============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
    CREATE TYPE staff_role AS ENUM ('owner', 'staff');
  END IF;
END $$;

-- =============================================
-- 2. CREATE STAFF_PROFILES TABLE IF NOT EXISTS
-- =============================================
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
-- 3. CREATE TRIGGER FUNCTION
-- =============================================
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
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. CREATE TRIGGER
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_staff_user();

-- =============================================
-- 5. SET UP RLS POLICIES
-- =============================================
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Owners can do everything on staff_profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can view all staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;

-- Create new policies
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
-- 6. FIX DJELATNIK USER
-- =============================================
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the user ID for djelatnik@beautyhouse.com
  SELECT id INTO user_id FROM auth.users WHERE email = 'djelatnik@beautyhouse.com';
  
  IF user_id IS NOT NULL THEN
    -- Insert or update staff profile
    INSERT INTO public.staff_profiles (id, email, full_name, role, active)
    VALUES (user_id, 'djelatnik@beautyhouse.com', 'Ana Djelatnik', 'staff', true)
    ON CONFLICT (id) 
    DO UPDATE SET 
      email = 'djelatnik@beautyhouse.com',
      full_name = 'Ana Djelatnik',
      role = 'staff',
      active = true,
      updated_at = NOW();
    
    RAISE NOTICE 'Staff profile created/updated for djelatnik@beautyhouse.com';
  ELSE
    RAISE NOTICE 'User djelatnik@beautyhouse.com not found in auth.users';
  END IF;
END $$;

-- =============================================
-- 7. CREATE ADMIN USER IF NOT EXISTS
-- =============================================
DO $$
DECLARE
  admin_id uuid;
BEGIN
  -- Check if admin user exists
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@beautyhouse.com';
  
  IF admin_id IS NULL THEN
    -- Create admin user
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
    
    -- Get the new admin ID
    SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@beautyhouse.com';
  END IF;
  
  -- Create/update admin staff profile
  INSERT INTO public.staff_profiles (id, email, full_name, role, active)
  VALUES (admin_id, 'admin@beautyhouse.com', 'Marijana Talović', 'owner', true)
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = 'admin@beautyhouse.com',
    full_name = 'Marijana Talović',
    role = 'owner',
    active = true,
    updated_at = NOW();
    
  RAISE NOTICE 'Admin profile created/updated for admin@beautyhouse.com';
END $$;

-- =============================================
-- 8. CREATE INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_staff_profiles_email ON public.staff_profiles(email);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_role ON public.staff_profiles(role);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_active ON public.staff_profiles(active);

-- =============================================
-- 9. VERIFICATION
-- =============================================
SELECT 
  'Verification - All staff profiles' as info,
  sp.id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  sp.created_at
FROM public.staff_profiles sp
ORDER BY sp.created_at;

-- =============================================
-- 10. SUCCESS MESSAGE
-- =============================================
SELECT 'Login fix completed successfully!' as status;
