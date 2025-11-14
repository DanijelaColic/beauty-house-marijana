-- SQL skripta za provjeru uloga djelatnika
-- Pokreni u Supabase SQL Editoru da vidiš tko je owner, a tko staff

SELECT 
  sp.id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM public.staff_profiles sp
LEFT JOIN auth.users au ON au.id = sp.user_id
WHERE sp.active = true
ORDER BY 
  sp.role DESC,  -- owner prvo, zatim staff
  sp.full_name;

-- Ako želiš promijeniti ulogu za Marijanu Talović na owner:
-- UPDATE public.staff_profiles
-- SET role = 'owner'
-- WHERE full_name ILIKE '%Marijana%' OR full_name ILIKE '%Talović%' OR full_name ILIKE '%Talovic%';

