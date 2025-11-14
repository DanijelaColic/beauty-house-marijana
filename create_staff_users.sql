-- SQL skripta za kreiranje djelatnika s fiktivnim email adresama
-- 
-- UPUTE:
-- 1. Prvo kreiraj korisnike u Supabase Dashboard → Authentication → Users
-- 2. Kopiraj User ID za svakog korisnika
-- 3. Zamijeni USER_ID_* ispod sa stvarnim UUID-ovima
-- 4. Pokreni UPDATE naredbe

-- ============================================
-- EMAIL ADRESE I PRIVREMENE LOZINKE
-- ============================================
/*
1. Ana Marić (Owner/Admin)
   Email: ana.maric@beautyhouse.hr
   Password: Ana2024!
   Role: owner

2. Petra Novak (Staff)
   Email: petra.novak@beautyhouse.hr
   Password: Petra2024!
   Role: staff

3. Marija Kovač (Staff)
   Email: marija.kovac@beautyhouse.hr
   Password: Marija2024!
   Role: staff

4. Sara Babić (Staff)
   Email: sara.babic@beautyhouse.hr
   Password: Sara2024!
   Role: staff

5. Nina Jurić (Staff)
   Email: nina.juric@beautyhouse.hr
   Password: Nina2024!
   Role: staff

6. Elena Božić (Staff)
   Email: elena.bozic@beautyhouse.hr
   Password: Elena2024!
   Role: staff
*/

-- ============================================
-- UPDATE NAREDBE ZA STAFF_PROFILES
-- ============================================
-- ZAMIJENI USER_ID_* sa stvarnim UUID-ovima iz Supabase Dashboarda

-- Ana Marić - Owner
-- UPDATE public.staff_profiles
-- SET 
--   role = 'owner',
--   full_name = 'Ana Marić',
--   email = 'ana.maric@beautyhouse.hr',
--   active = true
-- WHERE user_id = 'USER_ID_ANA_MARIC';

-- Petra Novak - Staff
-- UPDATE public.staff_profiles
-- SET 
--   role = 'staff',
--   full_name = 'Petra Novak',
--   email = 'petra.novak@beautyhouse.hr',
--   active = true
-- WHERE user_id = 'USER_ID_PETRA_NOVAK';

-- Marija Kovač - Staff
-- UPDATE public.staff_profiles
-- SET 
--   role = 'staff',
--   full_name = 'Marija Kovač',
--   email = 'marija.kovac@beautyhouse.hr',
--   active = true
-- WHERE user_id = 'USER_ID_MARIJA_KOVAC';

-- Sara Babić - Staff
-- UPDATE public.staff_profiles
-- SET 
--   role = 'staff',
--   full_name = 'Sara Babić',
--   email = 'sara.babic@beautyhouse.hr',
--   active = true
-- WHERE user_id = 'USER_ID_SARA_BABIC';

-- Nina Jurić - Staff
-- UPDATE public.staff_profiles
-- SET 
--   role = 'staff',
--   full_name = 'Nina Jurić',
--   email = 'nina.juric@beautyhouse.hr',
--   active = true
-- WHERE user_id = 'USER_ID_NINA_JURIC';

-- Elena Božić - Staff
-- UPDATE public.staff_profiles
-- SET 
--   role = 'staff',
--   full_name = 'Elena Božić',
--   email = 'elena.bozic@beautyhouse.hr',
--   active = true
-- WHERE user_id = 'USER_ID_ELENA_BOZIC';

-- ============================================
-- PROVJERA
-- ============================================
-- Pokreni ovu SELECT naredbu nakon što kreiraš sve korisnike:

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
