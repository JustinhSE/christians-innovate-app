-- Add admin policies for user_profiles and user_roles
-- Run this in your Supabase SQL Editor

-- ==========================================
-- USER PROFILES - ADMIN POLICIES
-- ==========================================

-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Allow admins to update any user profile
CREATE POLICY "Admins can update any profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- ==========================================
-- USER ROLES - ADMIN POLICIES
-- ==========================================

-- Allow admins to insert user roles
CREATE POLICY "Admins can create user roles"
  ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- Allow admins to update user roles
CREATE POLICY "Admins can update user roles"
  ON user_roles
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
