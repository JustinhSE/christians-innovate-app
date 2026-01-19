-- Ensure all auth.users have a corresponding user_profiles record
-- Run this in your Supabase SQL Editor

-- Insert missing profiles for users that don't have one
INSERT INTO user_profiles (user_id, full_name, ci_updates, bible_year, skill_share)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.email
  ) as full_name,
  false as ci_updates,
  false as bible_year,
  false as skill_share
FROM auth.users au
LEFT JOIN user_profiles up ON up.user_id = au.id
WHERE up.id IS NULL;

-- Update existing profiles to sync full_name from auth metadata if they're missing it
UPDATE user_profiles up
SET full_name = COALESCE(
  au.raw_user_meta_data->>'full_name',
  au.email
)
FROM auth.users au
WHERE up.user_id = au.id
  AND (up.full_name IS NULL OR up.full_name = '');

-- Verify all users have profiles
-- SELECT 
--   au.id,
--   au.email,
--   au.raw_user_meta_data->>'full_name' as auth_name,
--   up.full_name as profile_name,
--   up.avatar_url
-- FROM auth.users au
-- LEFT JOIN user_profiles up ON up.user_id = au.id
-- ORDER BY au.created_at DESC;
