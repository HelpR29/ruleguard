# LockIn Auth & Profiles Schema

This document describes how authentication and the `profiles` table are used in the app, plus maintenance commands to keep the data clean.

## Overview

- Supabase Authentication is used for signup/login and session handling.
- User-facing profile data lives in `public.profiles`.
- The app reads profile data in `src/context/AuthContext.tsx` via `fetchProfile()` and exposes it as `profile`.
- UI writes the display name from:
  - `src/components/DisplayNamePrompt.tsx`
  - `src/pages/Profile.tsx` (Edit Profile button)

## Expected Schema: `public.profiles`

- `id UUID PRIMARY KEY` (arbitrary row id)
- `user_id UUID UNIQUE NOT NULL` (matches `auth.users.id`)
- `display_name TEXT NULL`
- `updated_at TIMESTAMPTZ NULL` (optional, used for ordering in maintenance)

Recommended DDL:

```sql
-- Primary key and unique user pointer
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Enforce one row per user
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
```

Optional RLS policies (if you want to enable RLS):

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "profiles upsert own" ON public.profiles;

CREATE POLICY "profiles select own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles upsert own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## Maintenance: Deduplication & Constraints

If you ever see `could not create unique index` on `user_id`, it means duplicate rows exist. Use the following to inspect and clean.

### Inspect duplicates

```sql
-- Which user_ids are duplicated?
SELECT user_id, COUNT(*)
FROM public.profiles
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Inspect rows for a specific user (replace the UUID)
SELECT *
FROM public.profiles
WHERE user_id = '00000000-0000-0000-0000-000000000000'
ORDER BY COALESCE(updated_at, 'epoch') DESC, id DESC;
```

### Deduplicate (keep one best row per user_id)

Keeps, per `user_id`:
- A row with non-null `display_name` (preferred)
- Newest `updated_at`
- Highest `id` as tie-break

```sql
WITH ranked AS (
  SELECT
    id,
    user_id,
    display_name,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY (display_name IS NULL), COALESCE(updated_at, 'epoch') DESC, id DESC
    ) AS rn
  FROM public.profiles
)
DELETE FROM public.profiles p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1;
```

### Enforce uniqueness (if not already)

```sql
ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS profiles_user_id_key UNIQUE (user_id);
```

### Backfill or update display name

```sql
UPDATE public.profiles
SET display_name = 'Your Name'
WHERE user_id = '00000000-0000-0000-0000-000000000000';
```

## App Integration Notes

- `src/context/AuthContext.tsx`: single source of truth for reading `display_name`.
- `src/components/DisplayNamePrompt.tsx`: the only display-name capture; Header modal was removed.
- `src/components/ProtectedRoute.tsx`: protects routes, redirecting anonymous users to `/login`.
- `src/App.tsx`: `/` (Dashboard) is protected by `ProtectedRoute`.

## Troubleshooting

- If email confirmation opens on a different device, links to `http://localhost` won’t work there. Open the link on the same machine running Vite or disable email confirmations temporarily in Supabase Auth Settings for local dev.
- If profile name doesn’t show immediately:
  - Save once via Profile → Edit Profile
  - Hard refresh the app (Cmd+Shift+R)
  - Confirm the unique constraint exists on `user_id`.
```
