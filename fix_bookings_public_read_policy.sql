-- SQL skripta za omogućavanje public korisnicima (gostima) da vide rezervacije
-- Ovo je potrebno da gosti mogu vidjeti zauzete termine pri provjeri dostupnosti

-- Obriši postojeću politiku ako postoji (da izbjegnemo duplikate)
DROP POLICY IF EXISTS "Public can read bookings for availability" ON public.bookings;

-- Policy: Public korisnici (gosti) mogu vidjeti rezervacije za provjeru dostupnosti
-- Ova politika omogućava gostima da vide osnovne podatke o rezervacijama (datum, vrijeme, status)
-- kako bi mogli provjeriti dostupne termine
CREATE POLICY "Public can read bookings for availability"
ON public.bookings
FOR SELECT
TO public
USING (
  -- Omogući čitanje svih rezervacija koje nisu otkazane
  -- Gosti trebaju vidjeti zauzete termine da bi mogli provjeriti dostupnost
  status IN ('CONFIRMED', 'PENDING')
);

-- Provjera da li je politika uspješno kreirana
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
WHERE tablename = 'bookings'
AND cmd = 'SELECT'
ORDER BY policyname;

