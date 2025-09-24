-- SQL za brisanje postojećih tablica (pokreni prije supabase_setup.sql)

-- Brisanje tablica u obrnutom redoslijedu (zbog foreign key constraints)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS business_hours CASCADE;
DROP TABLE IF EXISTS time_off CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Brisanje tipova
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Brisanje funkcija
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
