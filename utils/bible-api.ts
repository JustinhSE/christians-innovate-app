// Bible API integration utilities
// API.Bible documentation: https://docs.api.bible/

const BIBLE_API_BASE_URL = process.env.BIBLE_API_ENDPOINT || 'https://rest.api.bible/v1'
const BIBLE_API_KEY = process.env.BIBLE_API_KEY

// Popular Bible translation IDs from API.Bible
export const BIBLE_TRANSLATIONS = {
  NIV: 'de4e12af7f28f599-02', // New International Version
  KJV: 'de4e12af7f28f599-01', // King James Version
  ESV: '01b29f4b342acc35-01', // English Standard Version
  NLT: '01b29f4b342acc35-02', // New Living Translation
  NKJV: '06125adad2d5898a-01', // New King James Version
  NASB: '06125adad2d5898a-02', // New American Standard Bible
} as const

export type TranslationKey = keyof typeof BIBLE_TRANSLATIONS

interface BibleApiVerseResponse {
  data: {
    id: string
    orgId: string
    bibleId: string
    bookId: string
    chapterId: string
    reference: string
    content: string
    verseCount: number
    copyright?: string
  }
}

interface BibleApiPassageResponse {
  data: {
    id: string
    bibleId: string
    bookId: string
    chapterId: string
    reference: string
    content: string
    copyright?: string
  }
}

/**
 * Fetch a single verse or passage from API.Bible
 * @param translation - Translation key (e.g., 'NIV', 'KJV')
 * @param reference - Bible reference (e.g., 'John 3:16' or 'Genesis 1:1-3')
 */
export async function fetchBibleVerse(
  translation: TranslationKey,
  reference: string
): Promise<{ text: string; html: string; reference: string } | null> {
  if (!BIBLE_API_KEY) {
    console.error('BIBLE_API_KEY is not set in environment variables')
    return null
  }

  const bibleId = BIBLE_TRANSLATIONS[translation]

  try {
    // Convert reference to API.Bible format (e.g., 'JHN.3.16')
    const verseId = convertReferenceToVerseId(reference)

    const url = `${BIBLE_API_BASE_URL}/bibles/${bibleId}/passages/${verseId}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`

    console.log('Fetching Bible verse:', { url, bibleId, verseId, hasKey: !!BIBLE_API_KEY })

    const response = await fetch(url, {
      headers: {
        'api-key': BIBLE_API_KEY,
      },
      next: { revalidate: 86400 * 30 }, // Cache for 30 days
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Bible API error: ${response.status} ${response.statusText}`, errorText)
      return null
    }

    const data: BibleApiPassageResponse = await response.json()

    return {
      text: stripHtml(data.data.content),
      html: data.data.content,
      reference: data.data.reference,
    }
  } catch (error) {
    console.error('Error fetching Bible verse:', error)
    return null
  }
}

/**
 * Convert a human-readable reference to API.Bible verse ID format
 * Examples: 'John 3:16' -> 'JHN.3.16', 'Genesis 1:1-3' -> 'GEN.1.1-GEN.1.3', 'Genesis 1' -> 'GEN.1'
 */
function convertReferenceToVerseId(reference: string): string {
  // This is a simplified conversion - you may need to expand this
  // based on all the books you want to support
  const bookAbbreviations: Record<string, string> = {
    'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
    'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
    '1 Samuel': '1SA', '2 Samuel': '2SA', '1 Kings': '1KI', '2 Kings': '2KI',
    'Psalms': 'PSA', 'Psalm': 'PSA', 'Proverbs': 'PRO', 'Ecclesiastes': 'ECC',
    'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
    'Acts': 'ACT', 'Romans': 'ROM', '1 Corinthians': '1CO', '2 Corinthians': '2CO',
    'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
    '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', '1 Timothy': '1TI', '2 Timothy': '2TI',
    'James': 'JAS', '1 Peter': '1PE', '2 Peter': '2PE', '1 John': '1JN', '2 John': '2JN',
    '3 John': '3JN', 'Revelation': 'REV',
  }

  // Try to parse with verse numbers: "John 3:16" or "Genesis 1:1-3"
  let match = reference.match(/^([A-Za-z0-9\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/)

  if (match) {
    const [, book, chapter, verseStart, verseEnd] = match
    const bookAbbr = bookAbbreviations[book.trim()]

    if (!bookAbbr) {
      return reference
    }

    if (verseEnd) {
      return `${bookAbbr}.${chapter}.${verseStart}-${bookAbbr}.${chapter}.${verseEnd}`
    }

    return `${bookAbbr}.${chapter}.${verseStart}`
  }

  // Try to parse chapter only: "Genesis 1"
  match = reference.match(/^([A-Za-z0-9\s]+)\s+(\d+)$/)

  if (match) {
    const [, book, chapter] = match
    const bookAbbr = bookAbbreviations[book.trim()]

    if (!bookAbbr) {
      return reference
    }

    return `${bookAbbr}.${chapter}`
  }

  // If parsing fails, return as-is and let API handle it
  return reference
}

/**
 * Strip HTML tags from text
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Parse a scripture reference to extract book, chapter, and verses
 */
export function parseScriptureReference(reference: string): {
  book: string
  chapter: number
  verseStart: number | null
  verseEnd: number | null
} | null {
  // Try to parse with verse numbers: "John 3:16" or "Genesis 1:1-3"
  let match = reference.match(/^([A-Za-z0-9\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/)

  if (match) {
    const [, book, chapter, verseStart, verseEnd] = match

    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verseStart: parseInt(verseStart),
      verseEnd: verseEnd ? parseInt(verseEnd) : null,
    }
  }

  // Try to parse chapter only: "Genesis 1"
  match = reference.match(/^([A-Za-z0-9\s]+)\s+(\d+)$/)

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
