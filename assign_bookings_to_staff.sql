-- SQL skripta za dodjelu postojećih rezervacija djelatnicima
-- Ova skripta će dodijeliti rezervacije koje nemaju staff_id

-- ============================================
-- PROVJERA POSTOJEĆIH REZERVACIJA
-- ============================================
-- Prvo provjeri koliko rezervacija nema staff_id

SELECT 
  COUNT(*) as total_bookings,
  COUNT(staff_id) as bookings_with_staff,
  COUNT(*) - COUNT(staff_id) as bookings_without_staff
FROM public.bookings;

-- Prikaži sve rezervacije bez staff_id
SELECT 
  id,
  client_name,
  client_email,
  start_at,
  service_id,
  status,
  staff_id
FROM public.bookings
WHERE staff_id IS NULL
ORDER BY start_at DESC;

-- ============================================
-- PROVJERA STAFF PROFILA
-- ============================================
-- Provjeri sve dostupne djelatnike

SELECT 
  id,
  full_name,
  email,
  role,
  active
FROM public.staff_profiles
WHERE active = true
ORDER BY role DESC, full_name;

-- ============================================
-- OPCIJE ZA DODJELU REZERVACIJA
-- ============================================

-- OPCIJA 1: Dodijeli sve rezervacije Owner-u (Ana Marić)
-- Zamijeni 'ANA_MARIC_STAFF_PROFILE_ID' sa stvarnim ID-om iz staff_profiles tablice
/*
UPDATE public.bookings
SET staff_id = 'ANA_MARIC_STAFF_PROFILE_ID'
WHERE staff_id IS NULL;
*/

-- OPCIJA 2: Ručna dodjela po ID-u rezervacije
-- Zamijeni 'BOOKING_ID' i 'STAFF_PROFILE_ID' sa stvarnim ID-ovima
/*
UPDATE public.bookings
SET staff_id = 'STAFF_PROFILE_ID'
WHERE id = 'BOOKING_ID';
*/

-- OPCIJA 3: Automatska distribucija po rotaciji (round-robin)
-- Ova skripta će distribuirati rezervacije po rotaciji među aktivnim djelatnicima
-- VAŽNO: Prvo pokreni fix_staff_id_foreign_key.sql da popraviš foreign key constraint!

DO $$
DECLARE
  booking_record RECORD;
  staff_members UUID[];
  current_index INTEGER := 0;
  staff_count INTEGER;
  staff_id_to_assign UUID;
BEGIN
  -- Dohvati sve aktivne staff profile ID-eve
  SELECT ARRAY_AGG(id ORDER BY role DESC, full_name)
  INTO staff_members
  FROM public.staff_profiles
  WHERE active = true;
  
  -- Provjeri da li ima staff članova
  IF staff_members IS NULL OR array_length(staff_members, 1) = 0 THEN
    RAISE EXCEPTION 'Nema aktivnih djelatnika za dodjelu rezervacija';
  END IF;
  
  staff_count := array_length(staff_members, 1);
  RAISE NOTICE 'Pronađeno % aktivnih djelatnika', staff_count;
  
  -- Prođi kroz sve rezervacije bez staff_id i dodijeli ih po rotaciji
  FOR booking_record IN 
    SELECT id FROM public.bookings WHERE staff_id IS NULL ORDER BY start_at
  LOOP
    -- Odaberi staff_id po rotaciji (1-based index)
    staff_id_to_assign := staff_members[(current_index % staff_count) + 1];
    
    -- Provjeri da li staff_id postoji u staff_profiles prije dodjele
    IF EXISTS (SELECT 1 FROM public.staff_profiles WHERE id = staff_id_to_assign AND active = true) THEN
      -- Dodijeli staff_id
      UPDATE public.bookings
      SET staff_id = staff_id_to_assign
      WHERE id = booking_record.id;
      
      current_index := current_index + 1;
    ELSE
      RAISE WARNING 'Staff ID % ne postoji ili nije aktivan, preskačem', staff_id_to_assign;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Dodijeljeno % rezervacija % djelatnicima', current_index, staff_count;
END $$;

-- ============================================
-- PROVJERA REZULTATA
-- ============================================
-- Provjeri kako su rezervacije distribuirane

SELECT 
  sp.full_name as staff_name,
  sp.role,
  COUNT(b.id) as booking_count
FROM public.staff_profiles sp
LEFT JOIN public.bookings b ON b.staff_id = sp.id
WHERE sp.active = true
GROUP BY sp.id, sp.full_name, sp.role
ORDER BY sp.role DESC, sp.full_name;

-- Detaljni prikaz svih rezervacija s djelatnicima
SELECT 
  b.id,
  b.client_name,
  b.start_at,
  b.status,
  sp.full_name as assigned_staff,
  sp.role as staff_role
FROM public.bookings b
LEFT JOIN public.staff_profiles sp ON sp.id = b.staff_id
ORDER BY b.start_at DESC;

