'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createDay(formData: FormData) {
  const supabase = await createClient()

  const planId = formData.get('plan_id') as string
  const dayNumber = parseInt(formData.get('day_number') as string)
  const scriptureReference = formData.get('scripture_reference') as string
  const contentMarkdown = formData.get('content_markdown') as string
  const dateAssigned = formData.get('date_assigned') as string

  if (!planId || !dayNumber || !scriptureReference) {
    return { error: 'Plan ID, Day Number, and Scripture Reference are required' }
  }

  const { error } = await supabase
    .from('plan_days')
    .insert({
      plan_id: planId,
      day_number: dayNumber,
      scripture_reference: scriptureReference,
      content_markdown: contentMarkdown || null,
      date_assigned: dateAssigned || null,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/plans/${planId}`)
  return { success: true }
}

export async function updateDay(formData: FormData) {
  const supabase = await createClient()

  const dayId = formData.get('day_id') as string
  const planId = formData.get('plan_id') as string
  const dayNumber = parseInt(formData.get('day_number') as string)
  const scriptureReference = formData.get('scripture_reference') as string
  const contentMarkdown = formData.get('content_markdown') as string
  const dateAssigned = formData.get('date_assigned') as string

  if (!dayId || !dayNumber || !scriptureReference) {
    return { error: 'Day ID, Day Number, and Scripture Reference are required' }
  }

  const { error } = await supabase
    .from('plan_days')
    .update({
      day_number: dayNumber,
      scripture_reference: scriptureReference,
      content_markdown: contentMarkdown || null,
      date_assigned: dateAssigned || null,
    })
    .eq('id', dayId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/plans/${planId}`)
  return { success: true }
}

export async function deleteDay(dayId: string, planId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('plan_days')
    .delete()
    .eq('id', dayId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/plans/${planId}`)
  return { success: true }
}
