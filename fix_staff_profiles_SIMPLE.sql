-- ============================================
-- PROVJERA POSTOJEĆIH KORISNIKA
-- ============================================
-- Prvo pokreni ovu SELECT naredbu da vidiš sve korisnike i njihove UUID-ove

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
-- INSERT/UPDATE NAREDBE - SAMO ZAMIJENI UUID-OVE
-- ============================================
-- Kopiraj UUID-ove iz gornje SELECT naredbe i zamijeni 'USER_ID_*' ispod
-- Ove naredbe će INSERT-ati novi profil ako ne postoji, ili UPDATE-ati postojeći

-- Ana Marić - Owner
INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
VALUES (
  'USER_ID_ANA_MARIC', -- ⬅️ ZAMIJENI sa UUID-om za ana.maric@beautyhouse.hr
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
  'USER_ID_PETRA_NOVAK', -- ⬅️ ZAMIJENI sa UUID-om za petra.novak@beautyhouse.hr
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
  'USER_ID_MARIJA_KOVAC', -- ⬅️ ZAMIJENI sa UUID-om za marija.kovac@beautyhouse.hr
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
  'USER_ID_SARA_BABIC', -- ⬅️ ZAMIJENI sa UUID-om za sara.babic@beautyhouse.hr
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
  'USER_ID_NINA_JURIC', -- ⬅️ ZAMIJENI sa UUID-om za nina.juric@beautyhouse.hr
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
  'USER_ID_ELENA_BOZIC', -- ⬅️ ZAMIJENI sa UUID-om za elena.bozic@beautyhouse.hr
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
-- PROVJERA REZULTATA
-- ============================================
-- Pokreni ovu SELECT naredbu nakon što kreiraš sve profile

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

-- Trebao bi vidjeti sve 6 djelatnika! ✅

