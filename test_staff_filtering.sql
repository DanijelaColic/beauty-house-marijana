-- SQL skripta za testiranje filtriranja rezervacija po djelatniku
-- Provjeri da li RLS politike rade kako treba

-- ============================================
-- PROVJERA DISTRIBUCIJE REZERVACIJA
-- ============================================
-- Provjeri koliko rezervacija ima svaki djelatnik

SELECT 
  sp.full_name as staff_name,
  sp.email,
  sp.role,
  COUNT(b.id) as booking_count
FROM public.staff_profiles sp
LEFT JOIN public.bookings b ON b.staff_id = sp.id
WHERE sp.active = true
GROUP BY sp.id, sp.full_name, sp.email, sp.role
ORDER BY sp.role DESC, sp.full_name;

-- ============================================
-- PROVJERA REZERVACIJA BEZ STAFF_ID
-- ============================================
-- Provjeri da li ima rezervacija koje još nemaju dodijeljenog djelatnika

SELECT 
  COUNT(*) as bookings_without_staff
FROM public.bookings
WHERE staff_id IS NULL;

-- ============================================
-- DETALJNI PRIKAZ REZERVACIJA S DJELATNICIMA
-- ============================================

SELECT 
  b.id,
  b.client_name,
  b.start_at,
  b.status,
  sp.full_name as assigned_staff,
  sp.email as staff_email,
  sp.role as staff_role
FROM public.bookings b
LEFT JOIN public.staff_profiles sp ON sp.id = b.staff_id
ORDER BY b.start_at DESC
LIMIT 20;

-- ============================================
-- PROVJERA RLS POLITIKA
-- ============================================
-- Provjeri da li su RLS politike ispravno postavljene

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- Trebao bi vidjeti:
-- - "Owner can view all bookings" (SELECT, authenticated)
-- - "Staff can view own bookings" (SELECT, authenticated)
-- - "Owner can update all bookings" (UPDATE, authenticated)
-- - "Staff can update own bookings" (UPDATE, authenticated)
-- - "Owner can delete all bookings" (DELETE, authenticated)
-- - "Staff can delete own bookings" (DELETE, authenticated)

