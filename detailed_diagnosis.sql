-- Detaljna dijagnostika login problema
-- Pokreni ovaj SQL u Supabase SQL Editor

-- =============================================
-- 1. PROVJERA STAFF_PROFILES TABLICE
-- =============================================

SELECT 
  'staff_profiles table exists' as check_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'staff_profiles'
  ) as result;

-- =============================================
-- 2. PROVJERA ENUM TIPA
-- =============================================

SELECT 
  'staff_role enum exists' as check_name,
  EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'staff_role'
  ) as result;

-- =============================================
-- 3. PROVJERA ADMIN KORISNIKA U AUTH.USERS
-- =============================================

SELECT 
  'admin user in auth.users' as check_name,
  u.id,
  u.email,
  u.email_confirmed_at,
  u.raw_user_meta_data,
  u.created_at
FROM auth.users u
WHERE u.email = 'admin@beautyhouse.com';

-- =============================================
-- 4. PROVJERA ADMIN KORISNIKA U STAFF_PROFILES
-- =============================================

SELECT 
  'admin user in staff_profiles' as check_name,
  sp.id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  sp.created_at
FROM public.staff_profiles sp
WHERE sp.email = 'admin@beautyhouse.com';

-- =============================================
-- 5. PROVJERA SVIH KORISNIKA I PROFILA
-- =============================================

SELECT 
  'All users and profiles' as info,
  u.id as user_id,
  u.email as user_email,
  u.email_confirmed_at,
  sp.id as profile_id,
  sp.email as profile_email,
  sp.full_name,
  sp.role,
  sp.active,
  CASE 
    WHEN sp.id IS NULL THEN 'MISSING PROFILE'
    WHEN sp.active = false THEN 'INACTIVE PROFILE'
    WHEN u.email_confirmed_at IS NULL THEN 'EMAIL NOT CONFIRMED'
    ELSE 'OK'
  END as status
FROM auth.users u
LEFT JOIN public.staff_profiles sp ON u.id = sp.id
WHERE u.email LIKE '%beautyhouse%' OR u.email LIKE '%admin%'
ORDER BY u.created_at;

-- =============================================
-- 6. PROVJERA RLS POLICIES
-- =============================================

SELECT 
  'RLS policies' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'staff_profiles'
ORDER BY policyname;

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

-- =============================================
-- 8. PROVJERA TABLICE STRUKTURE
-- =============================================

SELECT 
  'staff_profiles table structure' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'staff_profiles'
ORDER BY ordinal_position;

-- =============================================
-- 9. PROVJERA INDEKSA
-- =============================================

SELECT 
  'Indexes on staff_profiles' as info,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'staff_profiles' 
AND schemaname = 'public';

-- =============================================
-- 10. PROVJERA PERMISSIONS
-- =============================================

SELECT 
  'Table permissions' as info,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'staff_profiles';
