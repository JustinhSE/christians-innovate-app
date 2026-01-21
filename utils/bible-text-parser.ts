/**
 * Bible Text Parser
 * Handles translation-specific formatting and cleanup
 */

import type { TranslationKey } from './bible-api'

/**
 * Clean and parse bible text based on translation-specific formatting
 * @param text - Raw verse text from database
 * @param translation - Translation key (e.g., 'KJV', 'ESV')
 * @returns Cleaned text suitable for display
 */
export function parseBibleText(text: string, translation: TranslationKey): string {
  if (!text) return text

  let cleanedText = text

  switch (translation) {
    case 'KJV':
      // Remove Strong's numbers with tags: <S>7225</S>
      cleanedText = cleanedText.replace(/<S>\d+<\/S>/g, '')
      // Remove footnotes: <sup>text here</sup>
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any remaining HTML tags
      cleanedText = cleanedText.replace(/<\/?[^>]+(>|$)/g, '')
      // Remove orphaned Strong's numbers (numbers appearing after words without spaces)
      cleanedText = cleanedText.replace(/([a-zA-Z])(\d{2,5})/g, '$1 ')
      // Remove standalone sequences of digits that look like Strong's numbers
      cleanedText = cleanedText.replace(/\b\d{2,5}\b/g, '')
      // Remove Hebrew/Greek reference notes (pattern: "word: Heb. explanation" or "word: or, explanation")
      cleanedText = cleanedText.replace(/\s+[a-zA-Z\s]+:\s+(Heb\.|or,|that is,)[^.]*\./g, '')
      break

    case 'NKJV':
      // Remove Strong's numbers with tags
      cleanedText = cleanedText.replace(/<S>\d+<\/S>/g, '')
      // Remove footnotes
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any remaining HTML tags
      cleanedText = cleanedText.replace(/<\/?[^>]+(>|$)/g, '')
      // Remove orphaned Strong's numbers
      cleanedText = cleanedText.replace(/([a-zA-Z])(\d{2,5})/g, '$1 ')
      // Remove standalone sequences of digits
      cleanedText = cleanedText.replace(/\b\d{2,5}\b/g, '')
      // Remove Hebrew/Greek reference notes
      cleanedText = cleanedText.replace(/\s+[a-zA-Z\s]+:\s+(Heb\.|or,|that is,)[^.]*\./g, '')
      break

    case 'ESV':
      // ESV may have footnote markers like [1] or cross-references
      // Remove inline reference markers
      cleanedText = cleanedText.replace(/\[\d+\]/g, '')
      // Remove sup tags
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any remaining HTML tags but keep basic formatting
      cleanedText = cleanedText.replace(/<\/?(?!br|i|b)[^>]+(>|$)/g, '')
      break

    case 'NIV':
      // NIV may have footnote markers
      cleanedText = cleanedText.replace(/\[\d+\]/g, '')
      // Remove sup tags
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any remaining HTML tags but keep basic formatting
      cleanedText = cleanedText.replace(/<\/?(?!br|i|b)[^>]+(>|$)/g, '')
      break

    case 'NLT':
      // NLT typically clean but may have asterisk or other markers
      cleanedText = cleanedText.replace(/\*/g, '')
      // Remove sup tags
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any remaining HTML tags but keep basic formatting
      cleanedText = cleanedText.replace(/<\/?(?!br|i|b)[^>]+(>|$)/g, '')
      break

    case 'NASB':
      // NASB may have italics markers or brackets for added words
      // Remove footnotes
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any markup tags except basic formatting
      cleanedText = cleanedText.replace(/<\/?(?!br|i|b)[^>]+(>|$)/g, '')
      break

    case 'MSG':
      // MSG (The Message) is usually clean prose
      // Remove any footnotes or sup tags
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      // Remove any remaining HTML tags but keep basic formatting
      cleanedText = cleanedText.replace(/<\/?(?!br|i|b)[^>]+(>|$)/g, '')
      break

    default:
      // For unknown translations, apply generic cleanup
      cleanedText = cleanedText.replace(/<S>\d+<\/S>/g, '')
      cleanedText = cleanedText.replace(/\[\d+\]/g, '')
      cleanedText = cleanedText.replace(/<sup>.*?<\/sup>/g, '')
      cleanedText = cleanedText.replace(/<\/?[^>]+(>|$)/g, '')
  }

  // Common cleanup for all translations
  // Remove excessive whitespace
  cleanedText = cleanedText.replace(/\s+/g, ' ')
  // Trim leading/trailing whitespace
  cleanedText = cleanedText.trim()

  return cleanedText
}

/**
 * Parse HTML text if available, falling back to plain text parsing
 * @param text - Plain text version
 * @param html - HTML version (if available)
 * @param translation - Translation key
 * @returns Cleaned text
 */
export function parseBibleTextWithHtml(
  text: string,
  html: string | null | undefined,
  translation: TranslationKey
): string {
  // If HTML is available and different from text, prefer it
  // But still apply translation-specific cleanup
  const sourceText = (html && html !== text) ? html : text
  return parseBibleText(sourceText, translation)
}
