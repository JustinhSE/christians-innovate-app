-- Bible Verses Cache Table
-- Run this in your Supabase SQL Editor

-- ==========================================
-- BIBLE VERSES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS bible_verses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  translation VARCHAR(50) NOT NULL, -- e.g., 'NIV', 'KJV', 'ESV'
  book VARCHAR(50) NOT NULL, -- e.g., 'Genesis', 'John', 'Psalms'
  chapter INTEGER NOT NULL,
  verse_start INTEGER, -- NULL for entire chapters, number for specific verses
  verse_end INTEGER, -- NULL for single verse or entire chapter, number for verse ranges
  reference TEXT NOT NULL, -- e.g., 'John 3:16' or 'Genesis 1:1-3'
  text TEXT NOT NULL, -- The actual Bible text
  html_text TEXT, -- HTML formatted text (if provided by API)
  bible_id VARCHAR(50) NOT NULL, -- API.Bible translation ID
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Unique constraint to prevent duplicate verses
  UNIQUE(translation, book, chapter, verse_start, verse_end)
);

-- Enable RLS
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;

-- Anyone can view bible verses
CREATE POLICY "Anyone can view bible verses"
  ON bible_verses
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert verses (for caching from API)
CREATE POLICY "Authenticated users can insert bible verses"
  ON bible_verses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX idx_bible_verses_translation ON bible_verses(translation);
CREATE INDEX idx_bible_verses_book ON bible_verses(book);
CREATE INDEX idx_bible_verses_reference ON bible_verses(reference);
CREATE INDEX idx_bible_verses_lookup ON bible_verses(translation, book, chapter, verse_start, verse_end);

-- Example queries:
-- Find a specific verse:
-- SELECT * FROM bible_verses WHERE translation = 'NIV' AND book = 'John' AND chapter = 3 AND verse_start = 16 AND verse_end IS NULL;
-- 
-- Find a verse range:
-- SELECT * FROM bible_verses WHERE translation = 'NIV' AND book = 'Genesis' AND chapter = 1 AND verse_start = 1 AND verse_end = 3;
