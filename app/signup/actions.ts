'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const ciUpdates = formData.get('ci_updates') === 'true'
  const bibleYear = formData.get('bible_year') === 'true'
  const skillShare = formData.get('skill_share') === 'true'
  const referral = formData.get('referral') as string

  // Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (authError) {
    redirect('/signup?message=' + encodeURIComponent(authError.message))
  }

  // Create user profile with preferences
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        name,
        email,
        ci_updates: ciUpdates,
        bible_year: bibleYear,
        skill_share: skillShare,
        referral: referral || null,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue anyway - the auth account was created
    }
  }

  // Supabase may require email confirmation - redirect with success message
  redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account before logging in'))
}
