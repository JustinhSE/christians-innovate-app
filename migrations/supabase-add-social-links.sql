-- Add social media handles and website to user_profiles
-- Run this in your Supabase SQL Editor

-- Add new columns to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Comment on new columns
COMMENT ON COLUMN user_profiles.linkedin_url IS 'User LinkedIn profile URL';
COMMENT ON COLUMN user_profiles.facebook_url IS 'User Facebook profile URL';
COMMENT ON COLUMN user_profiles.twitter_url IS 'User Twitter/X profile URL';
COMMENT ON COLUMN user_profiles.website_url IS 'User personal or business website URL';
