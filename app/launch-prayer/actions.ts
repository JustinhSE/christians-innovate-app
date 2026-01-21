'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const type = formData.get('type') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!['launch', 'prayer', 'win'].includes(type)) {
    return { error: 'Invalid post type' }
  }

  const { error } = await supabase
    .from('launch_prayer_posts')
    .insert({
      user_id: user.id,
      type,
      title,
      content,
      is_active: true
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/launch-prayer')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function togglePostActive(postId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('launch_prayer_posts')
    .update({ is_active: !currentStatus })
    .eq('id', postId)
    .eq('user_id', user.id) // Ensure user owns the post

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/launch-prayer')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('launch_prayer_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id) // Ensure user owns the post

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/launch-prayer')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updatePost(postId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('launch_prayer_posts')
    .update({
      title,
      content
    })
    .eq('id', postId)
    .eq('user_id', user.id) // Ensure user owns the post

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/launch-prayer')
  revalidatePath('/dashboard')
  return { success: true }
}

// Admin actions
export async function adminHidePost(postId: string, shouldHide: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user is admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.is_admin) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('launch_prayer_posts')
    .update({ is_hidden: shouldHide })
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/launch-prayer')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function adminDeletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check if user is admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.is_admin) {
    return { error: 'Not authorized' }
  }

  const { error } = await supabase
    .from('launch_prayer_posts')
    .delete()
    .eq('id', postId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/launch-prayer')
  revalidatePath('/dashboard')
  return { success: true }
}
