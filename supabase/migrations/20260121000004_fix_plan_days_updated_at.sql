-- Migration to ensure updated_at column exists and trigger works properly
-- This migration is idempotent and safe to run multiple times

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'plan_days' 
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.plan_days 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_updated_at ON public.plan_days;

-- Recreate the trigger to ensure it's properly configured
CREATE TRIGGER set_updated_at 
BEFORE UPDATE ON public.plan_days 
FOR EACH ROW 
EXECUTE FUNCTION public.handle_updated_at();
