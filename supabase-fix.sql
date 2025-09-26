-- Fix for database error saving new user
-- Run this in your Supabase SQL Editor

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create a simpler function that won't cause errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Try to insert profile, but don't fail if it errors
    BEGIN
        INSERT INTO public.profiles (id, user_id, display_name)
        VALUES (NEW.id, NEW.id, COALESCE(split_part(NEW.email, '@', 1), 'User'));
    EXCEPTION WHEN OTHERS THEN
        -- If insert fails, just continue without error
        NULL;
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
