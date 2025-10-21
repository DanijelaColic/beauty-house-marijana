-- Diagnostika login problema
-- Pokreni ovaj SQL u Supabase SQL Editor da vidiš što je problem

-- =============================================
-- 1. PROVJERA POSTOJANJA TABLICE
-- =============================================

SELECT 
  'staff_profiles table exists' as check_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'staff_profiles'
  ) as result;

-- =============================================
-- 2. PROVJERA KORISNIKA U AUTH.USERS
-- =============================================

SELECT 
  'admin user exists in auth.users' as check_name,
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'admin@beautyhouse.com'
  ) as result;

-- =============================================
-- 3. PROVJERA KORISNIKA U STAFF_PROFILES
-- =============================================

SELECT 
  'admin user exists in staff_profiles' as check_name,
  EXISTS (
    SELECT 1 FROM public.staff_profiles 
    WHERE email = 'admin@beautyhouse.com'
  ) as result;

-- =============================================
-- 4. DETALJNI PODACI O KORISNIKU
-- =============================================

SELECT 
  'User details' as info,
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  sp.full_name,
  sp.role,
  sp.active,
  sp.created_at
FROM auth.users u
LEFT JOIN public.staff_profiles sp ON u.id = sp.id
WHERE u.email = 'admin@beautyhouse.com';

-- =============================================
-- 5. PROVJERA SVIH STAFF PROFILA
-- =============================================

SELECT 
  'All staff profiles' as info,
  sp.id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  sp.created_at
FROM public.staff_profiles sp
ORDER BY sp.created_at;

-- =============================================
-- 6. PROVJERA RLS POLICIES
-- =============================================

SELECT 
  'RLS policies on staff_profiles' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'staff_profiles';

-- =============================================
-- 7. PROVJERA TRIGGER-A
-- =============================================

SELECT 
  'Triggers on auth.users' as info,
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';
