import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { CreateMeetingForm } from './create-meeting-form'
import { MeetingList } from './meeting-list'
import { Calendar } from 'lucide-react'

export default async function MeetingsPage() {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // Check if user is admin
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.is_admin) {
    return redirect('/dashboard')
  }

  // Fetch all meetings with attendance count
  const { data: meetings } = await supabase
    .from('meetings')
    .select(`
      *,
      meeting_attendance(count)
    `)
    .order('meeting_date', { ascending: false })

  const meetingsWithCounts = meetings?.map(meeting => ({
    ...meeting,
    attendance_count: meeting.meeting_attendance?.[0]?.count || 0,
    meeting_attendance: undefined
  })) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Meetings Management</h1>
          </div>
          <p className="text-gray-600">
            Create and manage meeting announcements. Active meetings will appear in the announcement bar.
          </p>
        </div>

        {/* Create Meeting Form */}
        <CreateMeetingForm />

        {/* Meetings List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Meetings</h2>
          <MeetingList meetings={meetingsWithCounts} />
        </div>
      </div>
    </div>
  )
}
