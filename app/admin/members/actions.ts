'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleAdminStatus(userId: string, currentStatus: boolean) {
  const supabase = await createClient()

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.is_admin) {
    return { error: 'Not authorized' }
  }

  // Don't allow users to remove their own admin status
  if (userId === user.id && currentStatus) {
    return { error: 'Cannot remove your own admin status' }
  }

  // Check if user_roles entry exists
  const { data: existingRole } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existingRole) {
    // Update existing role
    const { error } = await supabase
      .from('user_roles')
      .update({ is_admin: !currentStatus })
      .eq('user_id', userId)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Insert new role
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: userId, is_admin: !currentStatus })

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/admin/members')
  return { success: true }
}
