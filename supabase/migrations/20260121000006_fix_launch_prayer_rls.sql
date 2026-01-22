-- Fix Launch Prayer Posts RLS Policy
-- The issue: Current policy only shows posts where is_active=true OR user owns it
-- This prevents posts from showing up unless they're explicitly active
-- Solution: Allow authenticated users to see all posts (filtering handled by app logic)

DO $$ 
BEGIN
  -- Drop the old restrictive policy
  DROP POLICY IF EXISTS "Anyone can view active posts" ON public.launch_prayer_posts;
  
  -- Create new policy that allows authenticated users to see all posts
  -- The app logic in page.tsx handles filtering by is_active and is_hidden
  CREATE POLICY "Authenticated users can view all posts" 
    ON public.launch_prayer_posts 
    FOR SELECT 
    USING (auth.uid() IS NOT NULL);
    
  -- Note: This allows authenticated users to see all posts
  -- The filtering logic in app/launch-prayer/page.tsx determines what's actually displayed:
  -- - Admins see everything
  -- - Users see their own posts (including inactive/hidden)
  -- - Users see active, non-hidden posts from others
  
END $$;
