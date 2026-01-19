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

export async function trackAttendance(meetingId: string, userId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('meeting_attendance')
    .insert({
      meeting_id: meetingId,
      user_id: userId
    })
    .select()
    .single()

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('Error tracking attendance:', error)
    throw error
  }

  return { success: true }
}
