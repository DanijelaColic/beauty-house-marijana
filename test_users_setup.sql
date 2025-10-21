-- Test korisnici za Beauty House Marijana
-- Pokreni ovaj SQL u Supabase SQL Editor

-- =============================================
-- 1. KREIRANJE TEST KORISNIKA
-- =============================================

-- Test Administrator (Owner)
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
  '550e8400-e29b-41d4-a716-446655440001',
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

-- Test Djelatnik (Staff)
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
  '550e8400-e29b-41d4-a716-446655440002',
  'authenticated',
  'authenticated',
  'djelatnik@beautyhouse.com',
  crypt('Staff123!', gen_salt('bf')),
  NOW(),
  '{"role": "staff", "full_name": "Ana Djelatnik"}',
  NOW(),
  NOW(),
  '',
  ''
);

-- =============================================
-- 2. AŽURIRANJE STAFF PROFILA
-- =============================================

-- Ažuriraj admin profil
UPDATE public.staff_profiles
SET 
  role = 'owner',
  full_name = 'Marijana Talović',
  active = true
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Ažuriraj staff profil
UPDATE public.staff_profiles
SET 
  role = 'staff',
  full_name = 'Ana Djelatnik',
  active = true
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- =============================================
-- 3. PROVJERA KORISNIKA
-- =============================================

-- Provjeri da li su korisnici kreirani
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  sp.full_name,
  sp.role,
  sp.active
FROM auth.users u
LEFT JOIN public.staff_profiles sp ON u.id = sp.id
WHERE u.email IN ('admin@beautyhouse.com', 'djelatnik@beautyhouse.com');

-- =============================================
-- 4. TEST PODACI ZAVRŠENI
-- =============================================

-- Sada možeš testirati prijavu sa:
-- 
-- ADMINISTRATOR:
-- Email: admin@beautyhouse.com
-- Password: Admin123!
-- Uloga: owner (puni pristup)
--
-- DJELATNIK:
-- Email: djelatnik@beautyhouse.com  
-- Password: Staff123!
-- Uloga: staff (pristup rezervacijama)
--
-- =============================================
-- 5. OPCIONALNO: BRISANJE TEST KORISNIKA
-- =============================================

-- Ako želiš obrisati test korisnike kasnije:
/*
DELETE FROM public.staff_profiles 
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM auth.users 
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
);
*/
