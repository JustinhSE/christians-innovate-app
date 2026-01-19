-- Fix Bible verse duplicates
-- Run this in your Supabase SQL Editor

-- Step 1: Add unique constraint to prevent future duplicates
-- This ensures the combination of translation, book, chapter, verse_start, verse_end is unique
ALTER TABLE bible_verses 
DROP CONSTRAINT IF EXISTS bible_verses_unique_verse;

ALTER TABLE bible_verses
ADD CONSTRAINT bible_verses_unique_verse 
UNIQUE (translation, book, chapter, verse_start, verse_end);

-- Step 2: Clean up existing duplicates (keep the oldest record for each unique verse)
DELETE FROM bible_verses a
WHERE a.id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY translation, book, chapter, verse_start, verse_end 
        ORDER BY created_at ASC
      ) as rn
    FROM bible_verses
  ) duplicates
  WHERE rn > 1
);

-- Step 3: Verify the cleanup
-- SELECT 
--   translation, 
--   book, 
--   chapter, 
--   verse_start, 
--   verse_end, 
--   COUNT(*) as count 
-- FROM bible_verses 
-- GROUP BY translation, book, chapter, verse_start, verse_end 
-- HAVING COUNT(*) > 1;
-- (Should return 0 rows)
