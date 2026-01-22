// Bible verse utilities
// Fetches verses from local Supabase database

import { createClient } from '@/utils/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { parseBibleText } from './bible-text-parser'

// Supported Bible translations (currently imported in database)
export const BIBLE_TRANSLATIONS = {
  KJV: 'KJV', // King James Version
  NKJV: 'NKJV', // New King James Version
  ESV: 'ESV', // English Standard Version
  NIV: 'NIV', // New International Version
  NLT: 'NLT', // New Living Translation
  NASB: 'NASB', // New American Standard Bible
  MSG: 'MSG', // The Message
} as const

export type TranslationKey = keyof typeof BIBLE_TRANSLATIONS

export interface IndividualVerse {
  verseNumber: number
  chapterNumber?: number
  text: string
}

/**
 * Fetch a single verse or passage from database
 * @param translation - Translation key (e.g., 'KJV')
 * @param reference - Bible reference (e.g., 'John 3:16' or 'Genesis 1:1-3')
 */
export async function fetchBibleVerse(
  translation: TranslationKey,
  reference: string
): Promise<{ text: string; html: string; reference: string } | null> {
  const translationCode = BIBLE_TRANSLATIONS[translation]

  // Parse the scripture reference
  const parsed = parseScriptureReference(reference)
  if (!parsed) {
    console.error('Failed to parse scripture reference:', reference)
    return null
  }

  try {
    const supabase = await createClient()

    // Handle chapter range (e.g., "Genesis 1 - 4")
    if (parsed.chapterEnd) {
      return fetchChapterRange(supabase, translationCode, parsed.book, parsed.chapter, parsed.chapterEnd, reference)
    }

    // Build query for single chapter or verse range
    let query = supabase
      .from('bible_verses')
      .select('text, verse_start')
      .eq('translation', translationCode)
      .eq('book', parsed.book)
      .eq('chapter', parsed.chapter)
      .order('verse_start', { ascending: true })

    // Filter by verse range if specified
    if (parsed.verseStart !== null) {
      query = query.gte('verse_start', parsed.verseStart)

      if (parsed.verseEnd !== null) {
        query = query.lte('verse_start', parsed.verseEnd)
      } else {
        query = query.eq('verse_start', parsed.verseStart)
      }
    }

    const { data: verses, error } = await query

    if (error) {
      console.error('Database error fetching verses:', error)
      return null
    }

    if (!verses || verses.length === 0) {
      console.error('No verses found for reference:', reference)
      return null
    }

    // Combine verses
    const combinedText = verses.map(v => v.text).join(' ')
    const cleanedText = parseBibleText(combinedText, translation)

    return {
      text: cleanedText,
      html: cleanedText, // No HTML formatting in database yet
      reference,
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching Bible verse:', error.message)
    } else {
      console.error('Error fetching Bible verse:', error)
    }
    return null
  }
}

/**
 * Fetch a range of chapters and combine them
 */
async function fetchChapterRange(
  supabase: SupabaseClient,
  translationCode: string,
  bookName: string,
  startChapter: number,
  endChapter: number,
  originalReference: string
): Promise<{ text: string; html: string; reference: string } | null> {
  try {
    // Fetch all verses for the chapter range
    const { data: verses, error } = await supabase
      .from('bible_verses')
      .select('chapter, verse_start, text')
      .eq('translation', translationCode)
      .eq('book', bookName)
      .gte('chapter', startChapter)
      .lte('chapter', endChapter)
      .order('chapter', { ascending: true })
      .order('verse_start', { ascending: true })

    if (error) {
      console.error('Database error fetching chapter range:', error)
      return null
    }

    if (!verses || verses.length === 0) {
      console.error('No verses found for chapter range:', originalReference)
      return null
    }

    // Determine translation from code
    const translationKey = Object.keys(BIBLE_TRANSLATIONS).find(
      key => BIBLE_TRANSLATIONS[key as TranslationKey] === translationCode
    ) as TranslationKey || 'KJV'

    // Group verses by chapter
    const chapterGroups = new Map<number, string[]>()
    verses.forEach((v: { chapter: number; text: string }) => {
      if (!chapterGroups.has(v.chapter)) {
        chapterGroups.set(v.chapter, [])
      }
      chapterGroups.get(v.chapter)!.push(v.text)
    })

    // Combine all chapters with chapter markers
    const combinedTextParts: string[] = []

    for (let chapterNum = startChapter; chapterNum <= endChapter; chapterNum++) {
      const chapterVerses = chapterGroups.get(chapterNum) || []
      if (chapterVerses.length > 0) {
        const chapterText = chapterVerses.join(' ')
        const cleanedChapterText = parseBibleText(chapterText, translationKey)
        combinedTextParts.push(`Chapter ${chapterNum}\n${cleanedChapterText}`)
      }
    }

    return {
      text: combinedTextParts.join('\n\n'),
      html: combinedTextParts.join('\n\n'),
      reference: originalReference,
    }
  } catch (error) {
    console.error('Error fetching chapter range:', error)
    return null
  }
}

/**
 * Fetch verses individually with verse numbers (for verse-by-verse display)
 * @param translation - Translation key (e.g., 'KJV')
 * @param reference - Bible reference (e.g., 'John 3:16' or 'Genesis 1:1-3')
 * @returns Array of individual verses with their numbers
 */
export async function fetchBibleVersesIndividually(
  translation: TranslationKey,
  reference: string
): Promise<{ verses: IndividualVerse[]; reference: string } | null> {
  const translationCode = BIBLE_TRANSLATIONS[translation]

  // Parse the scripture reference
  const parsed = parseScriptureReference(reference)
  if (!parsed) {
    console.error('Failed to parse scripture reference:', reference)
    return null
  }

  try {
    const supabase = await createClient()

    // Handle chapter range (e.g., "Genesis 1-4")
    if (parsed.chapterEnd) {
      const { data: verses, error } = await supabase
        .from('bible_verses')
        .select('chapter, verse_start, text')
        .eq('translation', translationCode)
        .eq('book', parsed.book)
        .gte('chapter', parsed.chapter)
        .lte('chapter', parsed.chapterEnd)
        .order('chapter', { ascending: true })
        .order('verse_start', { ascending: true })

      if (error) {
        console.error('Database error fetching verses:', error)
        return null
      }

      if (!verses || verses.length === 0) {
        console.error('No verses found for reference:', reference)
        return null
      }

      // Parse each verse individually with chapter numbers
      const individualVerses: IndividualVerse[] = verses.map(v => ({
        chapterNumber: v.chapter,
        verseNumber: v.verse_start,
        text: parseBibleText(v.text, translation)
      }))

      return {
        verses: individualVerses,
        reference,
      }
    }

    // Build query for single chapter or verse range
    let query = supabase
      .from('bible_verses')
      .select('chapter, text, verse_start')
      .eq('translation', translationCode)
      .eq('book', parsed.book)
      .eq('chapter', parsed.chapter)
      .order('verse_start', { ascending: true })

    // Filter by verse range if specified
    if (parsed.verseStart !== null) {
      query = query.gte('verse_start', parsed.verseStart)

      if (parsed.verseEnd !== null) {
        query = query.lte('verse_start', parsed.verseEnd)
      } else {
        query = query.eq('verse_start', parsed.verseStart)
      }
    }

    const { data: verses, error } = await query

    if (error) {
      console.error('Database error fetching verses:', error)
      return null
    }

    if (!verses || verses.length === 0) {
      console.error('No verses found for reference:', reference)
      return null
    }

    // Parse each verse individually
    const individualVerses: IndividualVerse[] = verses.map(v => ({
      chapterNumber: v.chapter,
      verseNumber: v.verse_start,
      text: parseBibleText(v.text, translation)
    }))

    return {
      verses: individualVerses,
      reference,
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching Bible verses individually:', error.message)
    } else {
      console.error('Error fetching Bible verses individually:', error)
    }
    return null
  }
}

/**
 * Parse a scripture reference to extract book, chapter, and verses
 */
export function parseScriptureReference(reference: string): {
  book: string
  chapter: number
  chapterEnd?: number
  verseStart: number | null
  verseEnd: number | null
} | null {
  // Normalize different dash types to regular hyphen
  const normalizedRef = reference.replace(/[–—−]/g, '-')

  // Try to parse with verse numbers: "John 3:16" or "Genesis 1:1-3"
  let match = normalizedRef.match(/^([A-Za-z0-9\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/)

  if (match) {
    const [, book, chapter, verseStart, verseEnd] = match

    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verseStart: parseInt(verseStart),
      verseEnd: verseEnd ? parseInt(verseEnd) : null,
    }
  }

  // Try to parse chapter range: "Genesis 1 - 4" or "Genesis 1-4"
  match = normalizedRef.match(/^([A-Za-z0-9\s]+)\s+(\d+)\s*-\s*(\d+)$/)

  if (match) {
    const [, book, chapterStart, chapterEnd] = match

    return {
      book: book.trim(),
      chapter: parseInt(chapterStart),
      chapterEnd: parseInt(chapterEnd),
      verseStart: null,
      verseEnd: null,
    }
  }

  // Try to parse chapter only: "Genesis 1"
  match = normalizedRef.match(/^([A-Za-z0-9\s]+)\s+(\d+)$/)

  if (match) {
    const [, book, chapter] = match

    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verseStart: null,
      verseEnd: null,
    }
  }

  return null
}
