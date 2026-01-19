'use client'

import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { trackAttendance } from './actions'

interface Meeting {
  id: string
  title: string
  description: string | null
  zoom_link: string
  meeting_date: string
}

interface AnnouncementBarProps {
  meeting: Meeting
  userId: string
}

export function AnnouncementBar({ meeting, userId }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isTracking, setIsTracking] = useState(false)

  if (!isVisible) return null

  const handleZoomClick = async () => {
    // Track attendance when user clicks the zoom link
    if (!isTracking) {
      setIsTracking(true)
      try {
        await trackAttendance(meeting.id, userId)
      } catch (error) {
        console.error('Error tracking attendance:', error)
      }
    }

    // Open zoom link in new tab
    window.open(meeting.zoom_link, '_blank', 'noopener,noreferrer')
  }

  const meetingDate = new Date(meeting.meeting_date)
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <div className="bg-blue-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 text-center sm:text-left">
          <p className="font-semibold text-sm sm:text-base">
            {meeting.title}
          </p>
          <p className="text-xs sm:text-sm text-blue-100">
            {formattedDate}
            {meeting.description && ` • ${meeting.description}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleZoomClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium text-sm transition whitespace-nowrap"
          >
            <ExternalLink className="h-4 w-4" />
            Join Zoom Meeting
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-blue-700 rounded transition"
            aria-label="Dismiss announcement"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
