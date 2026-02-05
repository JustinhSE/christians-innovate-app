import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DirectoryClient } from './directory-client'

interface UserProfile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  skills: string[]
  interests: string[]
  looking_for_business_partner: boolean
  looking_for_accountability_partner: boolean
  linkedin_url: string | null
  facebook_url: string | null
  twitter_url: string | null
  website_url: string | null
}

export default async function DirectoryPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // Fetch all user profiles
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('*')
    .order('full_name', { ascending: true })

  const memberProfiles = (profiles || []) as UserProfile[]

  return <DirectoryClient profiles={memberProfiles} currentUserId={user.id} />
}
