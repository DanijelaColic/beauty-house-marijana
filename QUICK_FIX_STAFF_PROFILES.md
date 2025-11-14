# 🔧 Brzo rješenje za problem s staff_profiles

## Problem
Pokrenula si `create_staff_users.sql` skriptu, ali vidim samo 2 korisnika u `staff_profiles` tablici umjesto 6.

## Uzrok
UPDATE naredbe u `create_staff_users.sql` su **komentirane** (započinju s `--`), pa se ne izvršavaju. Također, ako profili još ne postoje, UPDATE ne može ništa ažurirati.

## Rješenje

### Korak 1: Provjeri postojeće korisnike
Pokreni ovu SELECT naredbu u Supabase SQL Editoru:

```sql
SELECT 
  au.id as user_id,
  au.email as auth_email,
  au.created_at as auth_created_at,
  sp.id as profile_id,
  sp.full_name,
  sp.role
FROM auth.users au
LEFT JOIN public.staff_profiles sp ON sp.user_id = au.id
ORDER BY au.created_at;
```

Ova naredba će ti pokazati:
- Svi korisnici koji su kreirani u Supabase Auth
- Njihovi User ID-evi (UUID)
- Da li već imaju profile u `staff_profiles` tablici

### Korak 2: Kreiraj sve korisnike u Supabase Dashboard
Ako nisi još kreirala sve korisnike:

1. Idi na **Supabase Dashboard** → **Authentication** → **Users**
2. Klikni **"Add user"** → **"Create new user"**
3. Za svakog djelatnika unesi:
   - **Email:** (koristi emailove iz `STAFF_EMAILS.md`)
   - **Password:** (koristi privremene lozinke iz `STAFF_EMAILS.md`)
   - **Auto Confirm:** ✅
4. Klikni **"Create user"**
5. **Kopiraj User ID** (UUID) - trebat će ti za Korak 3

### Korak 3: Pokreni `fix_staff_profiles.sql`
1. Otvori `fix_staff_profiles.sql` u editoru
2. Za svaki INSERT, zamijeni `USER_ID_*` sa stvarnim UUID-om iz Koraka 1
3. Pokreni skriptu u Supabase SQL Editoru

**Primjer:**
```sql
-- Zamijeni ovu liniju:
'USER_ID_ANA_MARIC'

-- Sa stvarnim UUID-om, npr:
'b784729d-7a71-42e7-8d91-d443eac6fa8c'
```

### Korak 4: Provjeri rezultat
Nakon što pokreneš skriptu, pokreni finalnu SELECT naredbu iz `fix_staff_profiles.sql`:

```sql
SELECT 
  sp.id,
  sp.user_id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  au.email as auth_email
FROM public.staff_profiles sp
LEFT JOIN auth.users au ON au.id = sp.user_id
ORDER BY sp.role DESC, sp.full_name;
```

Trebao bi vidjeti sve 6 djelatnika!

## Alternativno rješenje (ako ne možeš koristiti ON CONFLICT)

Ako `ON CONFLICT` ne radi (možda nema UNIQUE constraint na `user_id`), koristi ovu verziju:

```sql
-- Za svakog djelatnika, prvo provjeri da li postoji, pa INSERT ili UPDATE
DO $$
DECLARE
  user_uuid UUID := 'TWOJ_USER_ID_OVDJE';
BEGIN
  IF EXISTS (SELECT 1 FROM public.staff_profiles WHERE user_id = user_uuid) THEN
    UPDATE public.staff_profiles
    SET 
      email = 'ana.maric@beautyhouse.hr',
      full_name = 'Ana Marić',
      role = 'owner',
      active = true,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSE
    INSERT INTO public.staff_profiles (user_id, email, full_name, role, active, created_at, updated_at)
    VALUES (
      user_uuid,
      'ana.maric@beautyhouse.hr',
      'Ana Marić',
      'owner',
      true,
      NOW(),
      NOW()
    );
  END IF;
END $$;
```

Ponovi ovu naredbu za svakog djelatnika (zamijeni `user_uuid` i podatke).

