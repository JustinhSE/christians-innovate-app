import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // If authenticated, redirect to dashboard
    redirect('/dashboard')
  } else {
    // If not authenticated, redirect to login
    redirect('/login')
  }
}