-- Row Level Security Policies for Admin Tables
-- Run this in your Supabase SQL Editor

-- ==========================================
-- USER ROLES TABLE
-- ==========================================

-- Create user_roles table to track admin status
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Anyone can read user roles (to check if someone is admin)
CREATE POLICY "Anyone can view user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_is_admin ON user_roles(is_admin);

-- Insert your admin user(s) - REPLACE WITH YOUR EMAIL
-- You can add this after running the migration
-- INSERT INTO user_roles (user_id, is_admin)
-- SELECT id, true FROM auth.users WHERE email = 'victorrcrispinjr@gmail.com'
-- ON CONFLICT (user_id) DO UPDATE SET is_admin = true;

-- ==========================================
-- READING PLANS TABLE
-- ==========================================

-- Enable RLS on reading_plans (if not already enabled)
ALTER TABLE reading_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all reading plans
CREATE POLICY "Anyone can view reading plans"
  ON reading_plans
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create reading plans
CREATE POLICY "Only admins can create reading plans"
  ON reading_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Only admins can update reading plans
CREATE POLICY "Only admins can update reading plans"
  ON reading_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Only admins can delete reading plans
CREATE POLICY "Only admins can delete reading plans"
  ON reading_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- ==========================================
-- PLAN DAYS TABLE
-- ==========================================

-- Enable RLS on plan_days (if not already enabled)
ALTER TABLE plan_days ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all plan days
CREATE POLICY "Anyone can view plan days"
  ON plan_days
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can create plan days
CREATE POLICY "Only admins can create plan days"
  ON plan_days
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Only admins can update plan days
CREATE POLICY "Only admins can update plan days"
  ON plan_days
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Only admins can delete plan days
CREATE POLICY "Only admins can delete plan days"
  ON plan_days
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- ==========================================
-- USER PROGRESS TABLE
-- ==========================================

-- Enable RLS on user_progress (if not already enabled)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view all progress (to see leaderboard/community progress)
CREATE POLICY "Anyone can view all progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only insert their own progress
CREATE POLICY "Users can create own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own progress
CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own progress
CREATE POLICY "Users can delete own progress"
  ON user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
