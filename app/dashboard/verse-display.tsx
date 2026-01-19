'use client'

import { useState, useEffect } from 'react'
import { getBibleVerse } from './verse-actions'
import type { TranslationKey } from '@/utils/bible-api'
import { BookOpen, Loader2 } from 'lucide-react'

interface VerseDisplayProps {
  reference: string
  translation?: TranslationKey
  truncate?: boolean
  maxLength?: number
}

interface VerseData {
  text: string
  html: string
  reference: string
}

export function VerseDisplay({
  reference,
  translation = 'NIV',
  truncate = false,
  maxLength = 150
}: VerseDisplayProps) {
  const [verses, setVerses] = useState<VerseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadVerses() {
      setLoading(true)
      setError(false)

      try {
        // Split by comma to handle multiple references
        const references = reference.split(',').map(ref => ref.trim()).filter(ref => ref.length > 0)

        const results = await Promise.all(
          references.map(ref => getBibleVerse(ref, translation))
        )

        const validResults = results.filter(result => result !== null) as VerseData[]

        if (validResults.length > 0) {
          setVerses(validResults)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error loading verses:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadVerses()
  }, [reference, translation])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600 py-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading verse...</span>
      </div>
    )
  }

  if (error || verses.length === 0) {
    return (
      <div className="flex items-center gap-2 text-gray-500 py-4">
        <BookOpen className="h-4 w-4" />
        <span className="text-sm italic">Verse not available</span>
      </div>
    )
  }

  // For truncated view, use plain text
  if (truncate) {
    const combinedText = verses.map(v => v.text).join(' ... ')
    const displayText = combinedText.length > maxLength
      ? combinedText.substring(0, maxLength) + '...'
      : combinedText

    return (
      <div className="py-4 px-4 sm:px-6 bg-blue-50 border-l-4 border-blue-500 rounded">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-2">
              {displayText}
            </p>
            <p className="text-xs sm:text-sm text-blue-700 font-medium">
              {verses.map(v => v.reference).join(', ')} ({translation})
            </p>
          </div>
        </div>
      </div>
    )
  }

  // For full view, display each verse separately
  return (
    <div className="space-y-4">
      {verses.map((verse, index) => (
        <div key={index} className="py-4 px-4 sm:px-6 bg-blue-50 border-l-4 border-blue-500 rounded">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-2">
                {verse.reference}
              </p>
              <div
                className="text-sm sm:text-base text-gray-800 leading-relaxed mb-2"
                style={{
                  whiteSpace: 'pre-wrap',
                }}
              >
                {verse.text.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < verse.text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-blue-600 font-medium">
                ({translation})
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
