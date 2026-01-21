'use server'

import { createClient } from '@/utils/supabase/server'
import type { TranslationKey } from '@/utils/bible-api'

/**
 * Get user's preferred Bible translation
 */
export async function getUserPreferredTranslation(): Promise<TranslationKey> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return 'KJV' // Default for non-authenticated users
    }

    const { data: userData, error } = await supabase
      .from('user_profiles')
      .select('preferred_translation')
      .eq('user_id', user.id)
      .single()

    if (error || !userData) {
      console.error('Error fetching user preference:', error)
      return 'KJV'
    }

    return (userData.preferred_translation as TranslationKey) || 'KJV'
  } catch (error) {
    console.error('Error in getUserPreferredTranslation:', error)
    return 'KJV'
  }
}

/**
 * Save user's preferred Bible translation
 */
export async function saveUserPreferredTranslation(
  translation: TranslationKey
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ preferred_translation: translation })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error saving user preference:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in saveUserPreferredTranslation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
