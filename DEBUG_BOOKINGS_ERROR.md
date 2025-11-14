# 🔍 Debug Guide za "Failed to load bookings: 500"

## Koraci za debug

### 1. Provjeri server terminal logove

U terminalu gdje radiš `npm run dev`, trebao bi vidjeti detaljne logove:

```
📋 GET /api/admin/bookings - Starting...
🔐 Auth check result: { ... }
👤 Supabase authenticated user: { ... }
🔍 Fetching bookings with filter: { ... }
❌ Supabase query error: { ... }
```

**Što provjeriti:**
- Da li vidiš `❌ Supabase query error`?
- Što piše u `error.message`, `error.code`, `error.details`?

### 2. Pokreni SQL skriptu za popravljanje RLS

Pokreni `fix_bookings_rls_simple.sql` u Supabase SQL Editoru. Ova skripta:
- Obriše stare politike
- Kreira nove jednostavnije politike
- Privremeno omogućuje staff-u da vidi sve rezervacije (za debug)

### 3. Provjeri da li helper funkcije postoje

Pokreni u Supabase SQL Editoru:

```sql
-- Provjeri da li funkcije postoje
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN ('is_staff', 'is_owner', 'get_staff_profile_id')
AND pronamespace = 'public'::regnamespace;
```

### 4. Provjeri RLS politike

Pokreni u Supabase SQL Editoru:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;
```

Trebao bi vidjeti:
- "Anyone can insert bookings" (INSERT)
- "Owner can view all bookings" (SELECT)
- "Staff can view own bookings" (SELECT)
- "Owner can update all bookings" (UPDATE)
- "Staff can update own bookings" (UPDATE)
- "Owner can delete all bookings" (DELETE)
- "Staff can delete own bookings" (DELETE)

### 5. Testiraj direktno u Supabase

Pokreni u Supabase SQL Editoru (zamijeni `YOUR_USER_ID` sa stvarnim UUID-om):

```sql
-- Provjeri da li se može dohvatiti bookings kao authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'YOUR_USER_ID';

SELECT COUNT(*) FROM public.bookings;

-- Resetiraj role
RESET ROLE;
```

## Mogući problemi i rješenja

### Problem 1: "function get_staff_profile_id() does not exist"
**Rješenje:** Pokreni `update_bookings_rls_for_staff.sql` skriptu

### Problem 2: "permission denied for table bookings"
**Rješenje:** Provjeri da li su RLS politike kreirane - pokreni `fix_bookings_rls_simple.sql`

### Problem 3: "column staff_id does not exist"
**Rješenje:** Pokreni `add_staff_id_to_bookings.sql` ili `update_bookings_rls_for_staff.sql`

### Problem 4: JOIN error za staff_profiles
**Rješenje:** Privremeno sam uklonio staff join u kodu - trebao bi raditi bez njega

## Nakon debug-a

Kada radi, možemo:
1. Vratiti staff join u SELECT query
2. Promijeniti RLS politiku da staff vidi samo svoje rezervacije

