'use server'

import { revalidatePath } from 'next/cache'
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

  revalidatePath('/dashboard')
}

export async function subscribeToPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('plan_subscriptions')
    .insert({ user_id: user.id, plan_id: planId })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function unsubscribeFromPlan(planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('plan_subscriptions')
    .delete()
    .match({ user_id: user.id, plan_id: planId })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
