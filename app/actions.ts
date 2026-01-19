'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function toggleProgress(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const dayId = formData.get('day_id') as string
  const currentStatus = formData.get('current_status') === 'true'

  if (currentStatus) {
    // Uncheck
    await supabase.from('user_progress').delete().match({ user_id: user.id, day_id: dayId })
  } else {
    // Check
    await supabase.from('user_progress').insert({ user_id: user.id, day_id: dayId, is_completed: true })
  }

  revalidatePath('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
