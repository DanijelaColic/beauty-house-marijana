-- Fix RLS Policies - Rješavanje infinite recursion problema
-- Pokreni ovaj SQL u Supabase SQL Editor

-- =============================================
-- 1. UKLONI POSTOJEĆE PROBLEMATIČNE POLICIES
-- =============================================

-- Ukloni sve postojeće policies za staff_profiles
DROP POLICY IF EXISTS "Owners can do everything on staff_profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can view all staff profiles" ON public.staff_profiles;
DROP POLICY IF EXISTS "Staff can update own profile" ON public.staff_profiles;

-- Ukloni policies za services koje možda referenciraju staff_profiles
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
DROP POLICY IF EXISTS "Staff can view all services" ON public.services;
DROP POLICY IF EXISTS "Owners can manage services" ON public.services;

-- Ukloni policies za bookings koje možda referenciraju staff_profiles
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can view own bookings by email" ON public.bookings;
DROP POLICY IF EXISTS "Staff can view all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can update bookings" ON public.bookings;
DROP POLICY IF EXISTS "Staff can delete bookings" ON public.bookings;

-- =============================================
-- 2. KREIRAJ JEDNOSTAVNE POLICIES BEZ REKURZIJE
-- =============================================

-- STAFF_PROFILES - Jednostavne policies
CREATE POLICY "Enable read access for authenticated users" ON public.staff_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.staff_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.staff_profiles
    FOR UPDATE USING (auth.uid() = id);

-- SERVICES - Javno čitanje, autentificirani korisnici mogu upravljati
CREATE POLICY "Enable read access for all users" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.services
    FOR ALL USING (auth.role() = 'authenticated');

-- BOOKINGS - Javno kreiranje, autentificirani korisnici mogu upravljati
CREATE POLICY "Enable insert for all users" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.bookings
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- BUSINESS_HOURS - Javno čitanje
CREATE POLICY "Enable read access for all users" ON public.business_hours
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.business_hours
    FOR ALL USING (auth.role() = 'authenticated');

-- TIME_OFF - Javno čitanje aktivnih
CREATE POLICY "Enable read access for all users" ON public.time_off
    FOR SELECT USING (active = true);

CREATE POLICY "Enable all access for authenticated users" ON public.time_off
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- 3. PROVJERI DA SU POLICIES AKTIVNE
-- =============================================

-- Provjeri da li je RLS uključen
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('staff_profiles', 'services', 'bookings', 'business_hours', 'time_off');

-- Provjeri postojeće policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 4. TEST QUERIES
-- =============================================

-- Test čitanje services (trebalo bi raditi)
SELECT COUNT(*) as services_count FROM public.services;

-- Test čitanje staff_profiles (trebalo bi raditi za autentificirane korisnike)
-- SELECT COUNT(*) as staff_count FROM public.staff_profiles;

-- =============================================
-- GOTOVO!
-- =============================================
-- Nakon pokretanja ovog SQL-a, aplikacija bi trebala raditi bez infinite recursion greške.
-- Policies su sada jednostavne i ne referenciraju sebe same.
