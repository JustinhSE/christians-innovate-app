-- ============================================
-- ADD CHAPTER_END SUPPORT FOR BIBLE VERSES
-- ============================================

-- Add chapter_end column to bible_verses table
ALTER TABLE public.bible_verses 
ADD COLUMN IF NOT EXISTS chapter_end INTEGER;

-- Update the index to include chapter_end
DROP INDEX IF EXISTS idx_bible_verses_lookup;
CREATE INDEX idx_bible_verses_lookup ON public.bible_verses(
  translation, 
  book, 
  chapter, 
  chapter_end,
  verse_start, 
  verse_end
);
