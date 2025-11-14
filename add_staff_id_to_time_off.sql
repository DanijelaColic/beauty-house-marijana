-- SQL skripta za dodavanje staff_id kolone u time_off tablicu
-- Ova kolona će omogućiti individualne slobodne dane za određene djelatnike

-- Provjeri da li kolona već postoji prije dodavanja
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'time_off' 
    AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE public.time_off
    ADD COLUMN staff_id UUID REFERENCES public.staff_profiles(id) ON DELETE CASCADE;
    
    -- Dodaj komentar
    COMMENT ON COLUMN public.time_off.staff_id IS 'ID djelatnika za individualne slobodne dane. NULL znači globalni slobodan dan za sve djelatnike.';
    
    RAISE NOTICE 'Kolona staff_id je uspješno dodana u time_off tablicu';
  ELSE
    RAISE NOTICE 'Kolona staff_id već postoji u time_off tablici';
  END IF;
END $$;

-- Dodaj index za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_time_off_staff_id ON public.time_off(staff_id);

-- Provjeri strukturu tablice
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'time_off'
ORDER BY ordinal_position;

