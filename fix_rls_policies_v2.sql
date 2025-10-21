-- Fix RLS Policies V2 - Rješavanje infinite recursion problema
-- Pokreni ovaj SQL u Supabase SQL Editor

-- =============================================
-- 1. UKLONI SVE POSTOJEĆE POLICIES
-- =============================================

-- Ukloni sve policies za staff_profiles
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'staff_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.staff_profiles', policy_name);
    END LOOP;
END $$;

-- Ukloni sve policies za services
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'services'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.services', policy_name);
    END LOOP;
END $$;

-- Ukloni sve policies za bookings
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'bookings'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.bookings', policy_name);
    END LOOP;
END $$;

-- Ukloni sve policies za business_hours
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'business_hours'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.business_hours', policy_name);
    END LOOP;
END $$;

-- Ukloni sve policies za time_off
DO $$ 
DECLARE 
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'time_off'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.time_off', policy_name);
    END LOOP;
END $$;

-- =============================================
-- 2. KREIRAJ JEDNOSTAVNE POLICIES BEZ REKURZIJE
-- =============================================

-- STAFF_PROFILES - Jednostavne policies
CREATE POLICY "staff_profiles_select_authenticated" ON public.staff_profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "staff_profiles_insert_authenticated" ON public.staff_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "staff_profiles_update_own" ON public.staff_profiles
    FOR UPDATE USING (auth.uid() = id);

-- SERVICES - Javno čitanje, autentificirani korisnici mogu upravljati
CREATE POLICY "services_select_all" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "services_all_authenticated" ON public.services
    FOR ALL USING (auth.role() = 'authenticated');

-- BOOKINGS - Javno kreiranje, autentificirani korisnici mogu upravljati
CREATE POLICY "bookings_insert_all" ON public.bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "bookings_select_all" ON public.bookings
    FOR SELECT USING (true);

CREATE POLICY "bookings_all_authenticated" ON public.bookings
    FOR ALL USING (auth.role() = 'authenticated');

-- BUSINESS_HOURS - Javno čitanje
CREATE POLICY "business_hours_select_all" ON public.business_hours
    FOR SELECT USING (true);

CREATE POLICY "business_hours_all_authenticated" ON public.business_hours
    FOR ALL USING (auth.role() = 'authenticated');

-- TIME_OFF - Javno čitanje aktivnih
CREATE POLICY "time_off_select_active" ON public.time_off
    FOR SELECT USING (active = true);

CREATE POLICY "time_off_all_authenticated" ON public.time_off
    FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- 3. PROVJERI DA SU POLICIES AKTIVNE
-- =============================================

-- Provjeri da li je RLS uključen
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('staff_profiles', 'services', 'bookings', 'business_hours', 'time_off');

-- Provjeri nove policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- 4. TEST QUERIES
-- =============================================

-- Test čitanje services (trebalo bi raditi)
SELECT COUNT(*) as services_count FROM public.services;

-- Test čitanje business_hours (trebalo bi raditi)
SELECT COUNT(*) as business_hours_count FROM public.business_hours;

-- =============================================
-- GOTOVO!
-- =============================================
-- Nakon pokretanja ovog SQL-a, aplikacija bi trebala raditi bez infinite recursion greške.
-- Policies su sada jednostavne i ne referenciraju sebe same.

-- Ako i dalje imate probleme, možete privremeno onemogućiti RLS:
-- ALTER TABLE public.staff_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
