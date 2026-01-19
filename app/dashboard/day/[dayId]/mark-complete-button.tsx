'use client'

import { useState } from 'react'
import { toggleProgress } from '../../actions'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MarkCompleteButtonProps {
  dayId: string
  isCompleted: boolean
}

export function MarkCompleteButton({ dayId, isCompleted }: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    await toggleProgress(formData)

    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="day_id" value={dayId} />
      <input type="hidden" name="current_status" value={String(isCompleted)} />
      <button
        type="submit"
        disabled={loading}
        className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 ${isCompleted
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Updating...</span>
          </>
        ) : isCompleted ? (
          <>
            <CheckCircle2 className="h-5 w-5" />
            <span>Mark as Incomplete</span>
          </>
        ) : (
          <>
            <Circle className="h-5 w-5" />
            <span>Mark as Complete</span>
          </>
        )}
      </button>
    </form>
  )
}
