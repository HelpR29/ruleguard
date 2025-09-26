-- Fix profiles table structure
-- Run this in your Supabase SQL Editor

-- First, let's see what columns exist
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';

-- Add the missing id column if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

-- Make sure the id column is the primary key
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- Update existing rows to have proper IDs
UPDATE public.profiles SET id = user_id WHERE id IS NULL;
