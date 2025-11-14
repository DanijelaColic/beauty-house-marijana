-- SQL skripta za INSERT-anje ili UPDATE-anje staff_profiles korisnika
-- VAŽNO: Ova skripta pretpostavlja da su korisnici VEĆ kreirani u Supabase Auth
-- 
-- KORAK 1: Prvo kreiraj sve korisnike u Supabase Dashboard → Authentication → Users
-- KORAK 2: Kopiraj User ID za svakog korisnika iz Dashboarda
-- KORAK 3: Zamijeni USER_ID_* ispod sa stvarnim UUID-ovima
-- KORAK 4: Pokreni ovu skriptu

-- ============================================
-- PROVJERA POSTOJEĆIH KORISNIKA U AUTH.USERS
-- ============================================
-- Prvo provjeri koje korisnike već imaš u auth.users i njihove profile

SELECT 
  au.id as user_id,
  au.email as auth_email,
  au.created_at as auth_created_at,
  sp.id as profile_id,
  sp.full_name,
  sp.role
FROM auth.users au
LEFT JOIN public.staff_profiles sp ON sp.user_id = au.id
ORDER BY au.created_at;

-- ============================================
-- INSERT/UPDATE NAREDBE ZA SVAKOG DJELATNIKA
-- ============================================
-- ZAMIJENI USER_ID_* sa stvarnim UUID-ovima iz gornje SELECT naredbe
-- Ova skripta će INSERT-ati novi profil ako ne postoji, ili UPDATE-ati postojeći

-- Ana Marić - Owner
-- ZAMIJENI 'USER_ID_ANA_MARIC' sa stvarnim UUID-om iz Supabase Dashboarda
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_ANA_MARIC', -- Zamijeni sa stvarnim UUID-om
  'ana.maric@beautyhouse.hr',
  'Ana Marić',
  'owner',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Petra Novak - Staff
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_PETRA_NOVAK', -- Zamijeni sa stvarnim UUID-om
  'petra.novak@beautyhouse.hr',
  'Petra Novak',
  'staff',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Marija Kovač - Staff
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_MARIJA_KOVAC', -- Zamijeni sa stvarnim UUID-om
  'marija.kovac@beautyhouse.hr',
  'Marija Kovač',
  'staff',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Sara Babić - Staff
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_SARA_BABIC', -- Zamijeni sa stvarnim UUID-om
  'sara.babic@beautyhouse.hr',
  'Sara Babić',
  'staff',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Nina Jurić - Staff
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_NINA_JURIC', -- Zamijeni sa stvarnim UUID-om
  'nina.juric@beautyhouse.hr',
  'Nina Jurić',
  'staff',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- Elena Božić - Staff
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_ELENA_BOZIC', -- Zamijeni sa stvarnim UUID-om
  'elena.bozic@beautyhouse.hr',
  'Elena Božić',
  'staff',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  active = EXCLUDED.active,
  updated_at = NOW();

-- ============================================
-- FINALNA PROVJERA
-- ============================================
SELECT 
  sp.id,
  sp.user_id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM public.staff_profiles sp
LEFT JOIN auth.users au ON au.id = sp.user_id
ORDER BY sp.role DESC, sp.full_name;

-- Trebao bi vidjeti sve 6 djelatnika s njihovim email adresama i ulogama
