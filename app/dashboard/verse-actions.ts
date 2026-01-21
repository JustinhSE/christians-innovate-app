'use server'

import { createClient } from '@/utils/supabase/server'
import { fetchBibleVerse, fetchBibleVersesIndividually, parseScriptureReference, type TranslationKey, type IndividualVerse } from '@/utils/bible-api'
import { parseBibleText } from '@/utils/bible-text-parser'

/**
 * Get Bible verse from cache or fetch from API
 * This checks the database first, and only queries the API if the verse isn't cached
 */
export async function getBibleVerse(
  reference: string,
  translation: TranslationKey = 'KJV'
): Promise<{ text: string; html: string; reference: string } | null> {
  const supabase = await createClient()

  // Parse the reference
  const parsed = parseScriptureReference(reference)
  if (!parsed) {
    console.error('Invalid scripture reference:', reference)
    return null
  }

  const { book, chapter, chapterEnd, verseStart, verseEnd } = parsed

  // Check if verse exists in cache
  // Build query with proper null handling
  let query = supabase
    .from('bible_verses')
    .select('*')
    .eq('translation', translation)
    .eq('book', book)
    .eq('chapter', chapter)

  // Handle chapter_end (null for single chapter references)
  if (chapterEnd === undefined || chapterEnd === null) {
    query = query.is('chapter_end', null)
  } else {
    query = query.eq('chapter_end', chapterEnd)
  }

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
    // Return cached verse with parsing applied
    // (in case old cache data has formatting issues)
    const cleanText = parseBibleText(cachedVerse.text, translation)
    const cleanHtml = cachedVerse.html_text
      ? parseBibleText(cachedVerse.html_text, translation)
      : cleanText

    return {
      text: cleanText,
      html: cleanHtml,
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
      chapter_end: chapterEnd || null,
      verse_start: verseStart,
      verse_end: verseEnd,
      reference: verseData.reference,
      text: verseData.text,
      html_text: verseData.html,
      bible_id: translation, // Use translation code as bible_id for Bolls.life
    })

  if (error) {
    console.error('Error caching Bible verse:', error)
    // Still return the verse even if caching fails
  }

  return verseData
}

/**
 * Prefetch multiple verses for a reading plan
 * Useful for batch loading verses to reduce API calls
 */
export async function prefetchVerses(
  references: string[],
  translation: TranslationKey = 'KJV'
): Promise<void> {
  // Fetch all verses in parallel
  await Promise.all(
    references.map(ref => getBibleVerse(ref, translation))
  )
}

/**
 * Get Bible verses individually with verse numbers
 * For verse-by-verse display mode
 */
export async function getBibleVersesIndividually(
  reference: string,
  translation: TranslationKey = 'KJV'
): Promise<{ verses: IndividualVerse[]; reference: string } | null> {
  return fetchBibleVersesIndividually(translation, reference)
}
