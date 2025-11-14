# 📧 Email adrese i lozinke za djelatnike

Ovaj dokument sadrži sve potrebne informacije za kreiranje djelatnika u Supabase Auth sustavu.

## 👥 Popis djelatnika

### 1. Ana Marić - Vlasnica/Admin
- **Email:** `ana.maric@beautyhouse.hr`
- **Privremena lozinka:** `Ana2024!`
- **Uloga:** `owner`
- **Pozicija:** Stilistica i frizer

### 2. Petra Novak - Djelatnik
- **Email:** `petra.novak@beautyhouse.hr`
- **Privremena lozinka:** `Petra2024!`
- **Uloga:** `staff`
- **Pozicija:** Specijalist za boju

### 3. Marija Kovač - Djelatnik
- **Email:** `marija.kovac@beautyhouse.hr`
- **Privremena lozinka:** `Marija2024!`
- **Uloga:** `staff`
- **Pozicija:** Frizerka i stilistica

### 4. Sara Babić - Djelatnik
- **Email:** `sara.babic@beautyhouse.hr`
- **Privremena lozinka:** `Sara2024!`
- **Uloga:** `staff`
- **Pozicija:** Beauty specijalist

### 5. Nina Jurić - Djelatnik
- **Email:** `nina.juric@beautyhouse.hr`
- **Privremena lozinka:** `Nina2024!`
- **Uloga:** `staff`
- **Pozicija:** Frizer i kolorist

### 6. Elena Božić - Djelatnik
- **Email:** `elena.bozic@beautyhouse.hr`
- **Privremena lozinka:** `Elena2024!`
- **Uloga:** `staff`
- **Pozicija:** Hair stylist

---

## 📋 Koraci za kreiranje djelatnika u Supabase

### Korak 1: Kreiraj korisnike u Supabase Dashboard

1. Idi na **Supabase Dashboard** → **Authentication** → **Users**
2. Klikni **"Add user"** → **"Create new user"**
3. Za svakog djelatnika unesi:
   - **Email:** (koristi emailove iznad)
   - **Password:** (koristi privremene lozinke iznad)
   - **Auto Confirm:** ✅ (omogući da se email automatski verificira)
4. Klikni **"Create user"**
5. **VAŽNO:** Kopiraj **User ID** (UUID) - trebat će ti za Korak 2

### Korak 2: Ažuriraj staff_profiles tablicu

Nakon što kreiraš sve korisnike, pokreni SQL skriptu `create_staff_users.sql` u Supabase SQL Editoru.

**ILI** ručno pokreni UPDATE naredbe za svakog djelatnika:

```sql
-- Ana Marić - Owner
UPDATE public.staff_profiles
SET 
  role = 'owner',
  full_name = 'Ana Marić',
  email = 'ana.maric@beautyhouse.hr',
  active = true
WHERE user_id = 'KOPIRAJ_USER_ID_IZ_DASHBOARDA';

-- Petra Novak - Staff
UPDATE public.staff_profiles
SET 
  role = 'staff',
  full_name = 'Petra Novak',
  email = 'petra.novak@beautyhouse.hr',
  active = true
WHERE user_id = 'KOPIRAJ_USER_ID_IZ_DASHBOARDA';

-- Marija Kovač - Staff
UPDATE public.staff_profiles
SET 
  role = 'staff',
  full_name = 'Marija Kovač',
  email = 'marija.kovac@beautyhouse.hr',
  active = true
WHERE user_id = 'KOPIRAJ_USER_ID_IZ_DASHBOARDA';

-- Sara Babić - Staff
UPDATE public.staff_profiles
SET 
  role = 'staff',
  full_name = 'Sara Babić',
  email = 'sara.babic@beautyhouse.hr',
  active = true
WHERE user_id = 'KOPIRAJ_USER_ID_IZ_DASHBOARDA';

-- Nina Jurić - Staff
UPDATE public.staff_profiles
SET 
  role = 'staff',
  full_name = 'Nina Jurić',
  email = 'nina.juric@beautyhouse.hr',
  active = true
WHERE user_id = 'KOPIRAJ_USER_ID_IZ_DASHBOARDA';

-- Elena Božić - Staff
UPDATE public.staff_profiles
SET 
  role = 'staff',
  full_name = 'Elena Božić',
  email = 'elena.bozic@beautyhouse.hr',
  active = true
WHERE user_id = 'KOPIRAJ_USER_ID_IZ_DASHBOARDA';
```

### Korak 3: Provjera

Pokreni ovu SELECT naredbu da provjeriš da su svi djelatnici kreirani:

```sql
SELECT 
  sp.id,
  sp.user_id,
  sp.email,
  sp.full_name,
  sp.role,
  sp.active,
  au.email as auth_email,
  au.created_at as auth_created_at
FROM public.staff_profiles sp
LEFT JOIN auth.users au ON au.id = sp.user_id
ORDER BY sp.role DESC, sp.full_name;
```

Trebao bi vidjeti svih 6 djelatnika s njihovim email adresama i ulogama.

---

## 🔐 Sigurnosne napomene

1. **Privremene lozinke:** Ove lozinke su privremene i za testiranje. Preporuča se da svaki djelatnik promijeni lozinku nakon prve prijave.

2. **Email verifikacija:** Auto Confirm je omogućen, ali u production okruženju bi trebalo zahtijevati email verifikaciju.

3. **Lozinka zahtjevi:** Trenutne lozinke zadovoljavaju Supabase zahtjeve (minimalno 6 znakova, kombinacija slova i brojeva).

---

## ✅ Nakon kreiranja

Nakon što su svi djelatnici kreirani, mogu se prijaviti na:
- **URL:** `/admin/login`
- **Email:** (koristi emailove iznad)
- **Lozinka:** (koristi privremene lozinke iznad)

