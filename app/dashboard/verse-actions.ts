'use server'

import { fetchBibleVersesIndividually, type TranslationKey, type IndividualVerse } from '@/utils/bible-api'

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
