-- Plan Subscriptions Table
-- Run this in your Supabase SQL Editor

-- ==========================================
-- PLAN SUBSCRIPTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS plan_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES reading_plans(id) ON DELETE CASCADE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, plan_id)
);

-- Enable RLS
ALTER TABLE plan_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view all subscriptions (to see who's in their community)
CREATE POLICY "Anyone can view plan subscriptions"
  ON plan_subscriptions
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can only subscribe themselves
CREATE POLICY "Users can create own subscriptions"
  ON plan_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only unsubscribe themselves
CREATE POLICY "Users can delete own subscriptions"
  ON plan_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX idx_plan_subscriptions_user_id ON plan_subscriptions(user_id);
CREATE INDEX idx_plan_subscriptions_plan_id ON plan_subscriptions(plan_id);
