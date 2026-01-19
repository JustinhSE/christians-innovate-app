'use client'

import { subscribeToPlan } from './actions'
import { useState } from 'react'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
    >
      {pending ? 'Subscribing...' : 'Subscribe'}
    </button>
  )
}

export function SubscribeButton({ planId }: { planId: string }) {
  const [error, setError] = useState<string | null>(null)
  
  async function handleSubscribe(formData: FormData) {
    setError(null)
    const result = await subscribeToPlan(planId)
    
    if (result?.error) {
      setError(result.error)
    }
  }
  
  return (
    <div>
      <form action={handleSubscribe}>
        <SubmitButton />
      </form>
      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
