-- Add email column back to user_profiles for admin access
-- Run this in your Supabase SQL Editor

-- Add email column (nullable since we'll sync it)
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Sync emails from auth.users to user_profiles
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.user_id = au.id;

-- Create function to automatically sync email when user_profiles is created or updated
CREATE OR REPLACE FUNCTION sync_email_from_auth()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync email on insert/update
DROP TRIGGER IF EXISTS sync_email_on_profile_change ON user_profiles;
CREATE TRIGGER sync_email_on_profile_change
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_email_from_auth();

-- Verify emails are synced
-- SELECT user_id, full_name, email FROM user_profiles ORDER BY created_at DESC;
