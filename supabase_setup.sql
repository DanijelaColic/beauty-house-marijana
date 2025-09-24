-- Supabase SQL shema za booking sustav
-- Pokreni ovaj SQL u Supabase SQL Editor

-- Omogući Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters-long';

-- Enumi
CREATE TYPE user_role AS ENUM ('ADMIN', 'CLIENT');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELED', 'NO_SHOW');

-- Korisnici
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role user_role DEFAULT 'CLIENT',
  email_verified TIMESTAMPTZ,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usluge
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- trajanje u minutama
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rezervacije
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podaci o klijentu
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  
  -- Rezervacija detalji
  service_id UUID NOT NULL REFERENCES services(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status booking_status DEFAULT 'PENDING',
  notes TEXT,
  
  -- Eksterni identifikatori
  google_event_id VARCHAR(255),
  outlook_event_id VARCHAR(255),
  cancel_token UUID UNIQUE DEFAULT gen_random_uuid(),
  
  -- Administracija
  admin_id UUID REFERENCES users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radno vrijeme
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time VARCHAR(5) NOT NULL, -- format "HH:mm"
  end_time VARCHAR(5) NOT NULL,   -- format "HH:mm"
  active BOOLEAN DEFAULT true,
  breaks JSONB, -- [{start: "12:00", end: "13:00"}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(day_of_week)
);

-- Dani kada se ne radi
CREATE TABLE time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT true,
  recurring BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksi za performanse
CREATE INDEX idx_bookings_start_at ON bookings(start_at);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
CREATE INDEX idx_time_off_dates ON time_off(start_date, end_date);

-- Funkcije za automatsko ažuriranje updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggeri za updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_hours_updated_at BEFORE UPDATE ON business_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_off_updated_at BEFORE UPDATE ON time_off FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Početni podaci
INSERT INTO business_hours (day_of_week, start_time, end_time, breaks) VALUES
(1, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]'), -- ponedjeljak
(2, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]'), -- utorak
(3, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]'), -- srijeda
(4, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]'), -- četvrtak
(5, '08:00', '20:00', '[{"start": "12:00", "end": "13:00"}]'), -- petak
(6, '08:00', '14:00', NULL); -- subota (kraže radno vrijeme)

INSERT INTO services (name, description, duration, price) VALUES
('Šišanje', 'Pranje, šišanje i styling.', 45, 25.00),
('Bojanje', 'Bojanje cijele kose ili izrast.', 90, 60.00),
('Styling', 'Feniranje i/ili kovrče.', 30, 20.00),
('Muško šišanje', 'Pranje i šišanje.', 30, 15.00),
('Dječje šišanje', 'Za djecu do 12 godina.', 25, 12.00),
('Njega kose', 'Maska, njega i masaža vlasišta.', 30, 18.00);
