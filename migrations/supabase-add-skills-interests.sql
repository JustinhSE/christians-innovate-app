-- Add skills, interests, and partnership preferences to user_profiles
-- Run this in your Supabase SQL Editor

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS looking_for_business_partner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS looking_for_accountability_partner BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Update the RLS policies to allow users to view other profiles for the directory
CREATE POLICY "Users can view all profiles for directory"
  ON user_profiles
  FOR SELECT
  USING (true);

-- Drop the old restrictive policy if it exists
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Comment on new columns
COMMENT ON COLUMN user_profiles.skills IS 'Array of skills the user has (e.g., web development, design, marketing)';
COMMENT ON COLUMN user_profiles.interests IS 'Array of interests the user has (e.g., entrepreneurship, ministry, technology)';
COMMENT ON COLUMN user_profiles.looking_for_business_partner IS 'Whether the user is looking for business partners';
COMMENT ON COLUMN user_profiles.looking_for_accountability_partner IS 'Whether the user is looking for accountability partners';
COMMENT ON COLUMN user_profiles.bio IS 'Short biography or description of the user';
