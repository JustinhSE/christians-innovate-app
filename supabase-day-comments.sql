-- Day Comments Table
-- Run this in your Supabase SQL Editor

-- ==========================================
-- DAY COMMENTS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS day_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_id UUID NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE day_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on days they have access to
CREATE POLICY "Users can view comments on their subscribed plans"
  ON day_comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plan_days pd
      JOIN plan_subscriptions ps ON pd.plan_id = ps.plan_id
      WHERE pd.id = day_comments.day_id
      AND ps.user_id = auth.uid()
    )
  );

-- Users can insert their own comments
CREATE POLICY "Users can insert their own comments"
  ON day_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON day_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON day_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX idx_day_comments_day_id ON day_comments(day_id);
CREATE INDEX idx_day_comments_user_id ON day_comments(user_id);
CREATE INDEX idx_day_comments_created_at ON day_comments(created_at DESC);

-- Example queries:
-- Get all comments for a specific day:
-- SELECT dc.*, up.full_name, up.email 
-- FROM day_comments dc
-- JOIN user_profiles up ON dc.user_id = up.id
-- WHERE dc.day_id = 'some-day-id'
-- ORDER BY dc.created_at ASC;
