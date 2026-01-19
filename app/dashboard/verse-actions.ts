'use server'

import { createClient } from '@/utils/supabase/server'
import { fetchBibleVerse, parseScriptureReference, type TranslationKey } from '@/utils/bible-api'

/**
 * Get Bible verse from cache or fetch from API
 * This checks the database first, and only queries the API if the verse isn't cached
 */
export async function getBibleVerse(
  reference: string,
  translation: TranslationKey = 'NIV'
): Promise<{ text: string; html: string; reference: string } | null> {
  const supabase = await createClient()

  // Parse the reference
  const parsed = parseScriptureReference(reference)
  if (!parsed) {
    console.error('Invalid scripture reference:', reference)
    return null
  }

  const { book, chapter, verseStart, verseEnd } = parsed

  // Check if verse exists in cache
  // Build query with proper null handling
  let query = supabase
    .from('bible_verses')
    .select('*')
    .eq('translation', translation)
    .eq('book', book)
    .eq('chapter', chapter)

  // Handle verse_start (null for chapter-only references)
  if (verseStart === null) {
    query = query.is('verse_start', null)
  } else {
    query = query.eq('verse_start', verseStart)
  }

  // Handle verse_end (null for single verses or chapters)
  if (verseEnd === null) {
    query = query.is('verse_end', null)
  } else {
    query = query.eq('verse_end', verseEnd)
  }

  const { data: cachedVerse } = await query.single()

  if (cachedVerse) {
    // Return cached verse
    return {
      text: cachedVerse.text,
      html: cachedVerse.html_text || cachedVerse.text,
      reference: cachedVerse.reference,
    }
  }

  // Not in cache - fetch from API
  const verseData = await fetchBibleVerse(translation, reference)

  if (!verseData) {
    return null
  }

  // Save to cache for future use
  const { error } = await supabase
    .from('bible_verses')
    .insert({
      translation,
      book,
      chapter,
      verse_start: verseStart,
      verse_end: verseEnd,
      reference: verseData.reference,
      text: verseData.text,
      html_text: verseData.html,
      bible_id: getBibleId(translation),
    })

  if (error) {
    console.error('Error caching Bible verse:', error)
    // Still return the verse even if caching fails
  }

  return verseData
}

/**
 * Get Bible ID for a translation
 */
function getBibleId(translation: TranslationKey): string {
  const ids: Record<TranslationKey, string> = {
    NIV: 'de4e12af7f28f599-02',
    KJV: 'de4e12af7f28f599-01',
    ESV: '01b29f4b342acc35-01',
    NLT: '01b29f4b342acc35-02',
    NKJV: '06125adad2d5898a-01',
    NASB: '06125adad2d5898a-02',
  }
  return ids[translation]
}

/**
 * Prefetch multiple verses for a reading plan
 * Useful for batch loading verses to reduce API calls
 */
export async function prefetchVerses(
  references: string[],
  translation: TranslationKey = 'NIV'
): Promise<void> {
  // Fetch all verses in parallel
  await Promise.all(
    references.map(ref => getBibleVerse(ref, translation))
  )
}
