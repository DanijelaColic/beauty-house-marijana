-- SQL skripta za popravljanje foreign key constraint za staff_id kolonu
-- Problem: Foreign key možda referencira pogrešnu tablicu ili ne postoji

-- Provjeri postojeći foreign key constraint
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'bookings'
  AND kcu.column_name = 'staff_id';

-- Obriši postojeći foreign key constraint ako postoji i referencira pogrešnu tablicu
DO $$
BEGIN
  -- Provjeri da li postoji constraint koji referencira 'staff' tablicu
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.table_name = 'bookings'
      AND kcu.column_name = 'staff_id'
      AND ccu.table_name = 'staff'
  ) THEN
    -- Obriši constraint koji referencira 'staff'
    ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_staff_id_fkey;
    RAISE NOTICE 'Obrisan constraint koji referencira staff tablicu';
  END IF;
END $$;

-- Obriši sve postojeće foreign key constraint-e za staff_id
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_staff_id_fkey;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_staff_id_fkey1;
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_staff_id_fkey2;

-- Kreiraj ispravan foreign key constraint koji referencira staff_profiles
DO $$
BEGIN
  -- Provjeri da li kolona staff_id postoji
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'staff_id'
  ) THEN
    -- Provjeri da li već postoji ispravan constraint
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'bookings'
        AND kcu.column_name = 'staff_id'
        AND ccu.table_name = 'staff_profiles'
        AND ccu.column_name = 'id'
    ) THEN
      -- Kreiraj novi constraint
      ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_staff_id_fkey
      FOREIGN KEY (staff_id)
      REFERENCES public.staff_profiles(id)
      ON DELETE SET NULL;
      
      RAISE NOTICE 'Kreiran ispravan foreign key constraint bookings_staff_id_fkey';
    ELSE
      RAISE NOTICE 'Ispravan foreign key constraint već postoji';
    END IF;
  ELSE
    RAISE NOTICE 'Kolona staff_id ne postoji - prvo je treba dodati';
  END IF;
END $$;

-- Provjeri da li je constraint ispravno kreiran
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'bookings'
  AND kcu.column_name = 'staff_id';

-- Trebao bi vidjeti:
-- constraint_name: bookings_staff_id_fkey
-- foreign_table_name: staff_profiles
-- foreign_column_name: id

