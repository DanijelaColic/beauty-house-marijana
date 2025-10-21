-- Privremeno onemogući RLS policies da aplikacija radi
-- Pokreni ovaj SQL u Supabase SQL Editor ako fix_rls_policies_v2.sql ne radi

-- =============================================
-- PRIVREMENO ONEMOGUĆI RLS
-- =============================================

-- Onemogući RLS na svim tablicama
ALTER TABLE public.staff_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_off DISABLE ROW LEVEL SECURITY;

-- Provjeri status RLS-a
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('staff_profiles', 'services', 'bookings', 'business_hours', 'time_off');

-- =============================================
-- TEST QUERIES
-- =============================================

-- Testiraj da li sada radi
SELECT COUNT(*) as services_count FROM public.services;
SELECT COUNT(*) as staff_profiles_count FROM public.staff_profiles;
SELECT COUNT(*) as bookings_count FROM public.bookings;

-- =============================================
-- NAPOMENA
-- =============================================
-- Ovo je PRIVREMENO rješenje za development/testing
-- U produkciji trebate ispravne RLS policies za sigurnost
-- 
-- Kada riješite RLS policies, možete ih ponovno uključiti:
-- ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.time_off ENABLE ROW LEVEL SECURITY;
