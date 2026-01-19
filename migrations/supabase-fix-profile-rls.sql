-- Fix user_profiles RLS to allow reading all profiles
-- Run this in your Supabase SQL Editor

-- Drop the restrictive read policy
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;

-- Create new policy: All authenticated users can read all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep the restrictive policies for UPDATE and INSERT (users can only modify their own)
-- These should already exist from the original migration
