-- Migration to add user preferences for Bible translation
-- This migration is idempotent and safe to run multiple times

-- Add preferred_translation column to user_profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_profiles' 
      AND column_name = 'preferred_translation'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN preferred_translation TEXT DEFAULT 'KJV';
  END IF;
END $$;

-- Add a check constraint to ensure valid translation values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'user_profiles' 
      AND constraint_name = 'user_profiles_preferred_translation_check'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_preferred_translation_check 
    CHECK (preferred_translation IN ('KJV', 'NKJV', 'ESV', 'NIV', 'NLT', 'NASB', 'MSG'));
  END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN public.user_profiles.preferred_translation IS 'User''s preferred Bible translation version';
