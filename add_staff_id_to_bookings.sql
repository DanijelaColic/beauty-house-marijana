-- SQL skripta za dodavanje staff_id kolone u bookings tablicu
-- Ova kolona će povezivati rezervacije s djelatnicima

-- Provjeri da li kolona već postoji prije dodavanja
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bookings' 
    AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL;
    
    RAISE NOTICE 'Kolona staff_id je uspješno dodana u bookings tablicu';
  ELSE
    RAISE NOTICE 'Kolona staff_id već postoji u bookings tablici';
  END IF;
END $$;

-- Dodaj index za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON public.bookings(staff_id);

-- Provjeri strukturu tablice
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'bookings'
AND column_name IN ('id', 'staff_id', 'admin_id')
ORDER BY ordinal_position;

