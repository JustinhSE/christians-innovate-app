-- Migration: Centralize user data to auth.users
-- Run this in your Supabase SQL Editor

-- Step 1: Remove email column (redundant with auth.users)
ALTER TABLE user_profiles DROP COLUMN IF EXISTS email;

-- Step 2: Add full_name column if it doesn't exist, or rename 'name' if it exists
DO $$
BEGIN
  -- Check if 'name' column exists and rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'name'
  ) THEN
    ALTER TABLE user_profiles RENAME COLUMN name TO full_name;
  -- If 'name' doesn't exist, ensure 'full_name' exists
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN full_name TEXT;
  END IF;
END $$;

-- Step 3: Sync existing data to auth.users metadata
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT user_id, full_name 
    FROM user_profiles 
    WHERE full_name IS NOT NULL
  LOOP
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(profile_record.full_name)
    )
    WHERE id = profile_record.user_id;
  END LOOP;
END $$;

-- Step 4: Create trigger to keep user_profiles.full_name in sync with auth.users metadata
-- This ensures when auth metadata is updated, user_profiles is also updated
CREATE OR REPLACE FUNCTION sync_user_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles when auth.users metadata changes
  UPDATE user_profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    updated_at = NOW()
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION sync_user_metadata();

-- Step 3: Verify the changes
-- You can run this to see the migrated data:
-- SELECT 
--   u.id, 
--   u.email, 
--   u.raw_user_meta_data->>'full_name' as full_name,
--   p.avatar_url,
--   p.ci_updates,
--   p.bible_year
-- FROM auth.users u
-- LEFT JOIN user_profiles p ON p.user_id = u.id;
