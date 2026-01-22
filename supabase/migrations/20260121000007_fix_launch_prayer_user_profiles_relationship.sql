-- Fix the relationship between launch_prayer_posts and user_profiles
-- Current issue: launch_prayer_posts.user_id references auth.users(id)
-- But we want to join with user_profiles for display
-- Solution: Change foreign key to reference user_profiles(user_id) instead

DO $$ 
BEGIN
  -- Drop the existing foreign key constraint
  ALTER TABLE public.launch_prayer_posts
    DROP CONSTRAINT IF EXISTS launch_prayer_posts_user_id_fkey;
  
  -- Add new foreign key that references user_profiles(user_id)
  -- This allows Supabase to understand the relationship for nested selects
  ALTER TABLE public.launch_prayer_posts
    ADD CONSTRAINT launch_prayer_posts_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES public.user_profiles(user_id) 
    ON DELETE CASCADE;
    
  -- Note: Since user_profiles.user_id has a foreign key to auth.users(id) with CASCADE,
  -- this maintains the same deletion behavior while allowing the join to work
  
END $$;
