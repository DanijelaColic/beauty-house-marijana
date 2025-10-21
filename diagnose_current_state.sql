-- Diagnose current state of login issue
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. CHECK IF USER EXISTS IN AUTH.USERS
-- =============================================
SELECT 
  'User in auth.users' as check_type,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'djelatnik@beautyhouse.com';

-- =============================================
-- 2. CHECK IF STAFF_PROFILES TABLE EXISTS
-- =============================================
SELECT 
  'staff_profiles table exists' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'staff_profiles'
  ) as result;

-- =============================================
-- 3. CHECK IF USER HAS STAFF PROFILE
-- =============================================
SELECT 
  'User staff profile' as check_type,
  sp.id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  sp.created_at
FROM public.staff_profiles sp
WHERE sp.email = 'djelatnik@beautyhouse.com';

-- =============================================
-- 4. CHECK ALL STAFF PROFILES
-- =============================================
SELECT 
  'All staff profiles' as check_type,
  sp.id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active
FROM public.staff_profiles sp
ORDER BY sp.created_at;

-- =============================================
-- 5. CHECK IF TRIGGER EXISTS
-- =============================================
SELECT 
  'Trigger exists' as check_type,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth'
AND trigger_name = 'on_auth_user_created';
