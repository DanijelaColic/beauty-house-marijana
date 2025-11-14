-- Provjera i popravak Ana Marić profila
-- Ova skripta provjerava da li Ana Marić ima role 'owner' i aktivira ga ako je potrebno

-- 1. Provjeri trenutno stanje Ana Marić profila
SELECT 
    id,
    email,
    full_name,
    role,
    active,
    user_id,
    created_at,
    updated_at
FROM public.staff_profiles
WHERE email ILIKE '%ana%maric%' 
   OR email ILIKE '%ana%marić%'
   OR full_name ILIKE '%ana%maric%'
   OR full_name ILIKE '%ana%marić%';

-- 2. Ažuriraj Ana Marić da bude owner i aktivna
UPDATE public.staff_profiles
SET 
    role = 'owner',
    active = true,
    updated_at = NOW()
WHERE (email ILIKE '%ana%maric%' 
   OR email ILIKE '%ana%marić%'
   OR full_name ILIKE '%ana%maric%'
   OR full_name ILIKE '%ana%marić%')
AND role != 'owner';

-- 3. Provjeri da li je ažurirano
SELECT 
    id,
    email,
    full_name,
    role,
    active,
    user_id
FROM public.staff_profiles
WHERE email ILIKE '%ana%maric%' 
   OR email ILIKE '%ana%marić%'
   OR full_name ILIKE '%ana%maric%'
   OR full_name ILIKE '%ana%marić%';

-- 4. Provjeri da li postoji user_id i da li je povezan s auth.users
SELECT 
    sp.id as profile_id,
    sp.email as profile_email,
    sp.full_name,
    sp.role,
    sp.active,
    sp.user_id,
    au.id as auth_user_id,
    au.email as auth_email,
    au.email_confirmed_at
FROM public.staff_profiles sp
LEFT JOIN auth.users au ON sp.user_id = au.id
WHERE sp.email ILIKE '%ana%maric%' 
   OR sp.email ILIKE '%ana%marić%'
   OR sp.full_name ILIKE '%ana%maric%'
   OR sp.full_name ILIKE '%ana%marić%';

-- 5. Provjeri RLS politike za time_off tablicu
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'time_off'
ORDER BY policyname;

