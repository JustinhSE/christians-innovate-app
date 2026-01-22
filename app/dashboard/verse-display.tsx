'use client'

import { useState, useEffect } from 'react'
import { getBibleVerse, getBibleVersesIndividually } from './verse-actions'
import { getUserPreferredTranslation, saveUserPreferredTranslation } from './user-preferences-actions'
import type { TranslationKey, IndividualVerse } from '@/utils/bible-api'
import { parseBibleText } from '@/utils/bible-text-parser'
import { BookOpen, Loader2, ChevronDown, List, AlignLeft } from 'lucide-react'

interface VerseDisplayProps {
  reference: string
  translation?: TranslationKey
  truncate?: boolean
  maxLength?: number
  showVersionSelector?: boolean
  showViewModeToggle?: boolean
  defaultViewMode?: 'paragraph' | 'verse-by-verse'
  usePreferredTranslation?: boolean
}

interface VerseData {
  text: string
  html: string
  reference: string
}

interface VerseByVerseViewProps {
  reference: string
  verses: IndividualVerse[]
  selectedVersion: TranslationKey
}

interface ParagraphViewProps {
  verses: VerseData[]
  selectedVersion: TranslationKey
}

const AVAILABLE_VERSIONS: { value: TranslationKey; label: string }[] = [
  { value: 'KJV', label: 'KJV - King James Version' },
  { value: 'NKJV', label: 'NKJV - New King James Version' },
  { value: 'ESV', label: 'ESV - English Standard Version' },
  { value: 'NIV', label: 'NIV - New International Version' },
  { value: 'NLT', label: 'NLT - New Living Translation' },
  { value: 'NASB', label: 'NASB - New American Standard Bible' },
  { value: 'MSG', label: 'MSG - The Message' },
]

function VerseByVerseView({ reference, verses, selectedVersion }: VerseByVerseViewProps) {
  if (verses.length === 0) {
    return (
      <div className="py-4 px-4 sm:px-6 bg-blue-50 border-l-4 border-blue-500 rounded">
        <div className="flex items-center gap-2 text-gray-600">
          <BookOpen className="h-4 w-4" />
          <span className="text-sm italic">No verses available</span>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 px-4 sm:px-6 bg-blue-50 border-l-4 border-blue-500 rounded">
      <div className="flex items-start gap-3">
        <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-3">
            {reference}
          </p>
          <div className="space-y-3">
            {verses.map((verse, idx) => {
              // if the verse.versenumber is null dont render it
              if (verse.verseNumber === null) return null
              // Check if this is the start of a new chapter
              const isNewChapter = verse.chapterNumber &&
                (idx === 0 || verse.chapterNumber !== verses[idx - 1].chapterNumber)

              return (
                <div key={`${verse.chapterNumber || 1}-${verse.verseNumber}`}>
                  {isNewChapter && verse.chapterNumber && (
                    <div className="font-bold text-blue-700 text-lg mt-6 first:mt-0 mb-3">
                      Chapter {verse.chapterNumber}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <span className="text-sm font-bold text-blue-700 flex-shrink-0 select-none">
                      {verse.verseNumber}
                    </span>
                    <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
                      {verse.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs sm:text-sm text-blue-600 font-medium mt-3">
            ({selectedVersion})
          </p>
        </div>
      </div>
    </div>
  )
}

function ParagraphView({ verses, selectedVersion }: ParagraphViewProps) {
  return (
    <>
      {verses.map((verse, index) => {
        // Apply parsing to ensure clean text
        const parsedText = parseBibleText(verse.text, selectedVersion)
        // Text format is: "Chapter X\n[text]\n\nChapter Y\n[text]"
        // Split by double newline to separate chapters
        const chapters = parsedText.split('\n\n')

        return (
          <div key={index} className="py-4 px-4 sm:px-6 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-2">
                  {verse.reference}
                </p>
                <div className="text-sm sm:text-base text-gray-800 leading-relaxed mb-2 space-y-6">
                  {chapters.map((chapter, i) => {
                    // Each chapter is "Chapter X\n[text]"
                    const lines = chapter.split('\n')
                    const isChapterFormat = lines[0]?.startsWith('Chapter ')

                    if (isChapterFormat) {
                      const heading = lines[0]
                      const content = lines.slice(1).join(' ')
                      return (
                        <div key={i}>
                          <div className="font-bold text-blue-700 text-lg mb-3">
                            {heading}
                          </div>
                          <p>{content}</p>
                        </div>
                      )
                    }

                    // Single verse/passage without chapter heading
                    return <p key={i}>{chapter}</p>
                  })}
                </div>
                <p className="text-xs sm:text-sm text-blue-600 font-medium">
                  ({selectedVersion})
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export function VerseDisplay({
  reference,
  translation: initialTranslation = 'NLT',
  truncate = false,
  maxLength = 150,
  showVersionSelector = false,
  showViewModeToggle = false,
  defaultViewMode = 'verse-by-verse',
  usePreferredTranslation = false
}: VerseDisplayProps) {
  const [verses, setVerses] = useState<VerseData[]>([])
  const [individualVerses, setIndividualVerses] = useState<IndividualVerse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<TranslationKey>(initialTranslation)
  const [viewMode, setViewMode] = useState<'paragraph' | 'verse-by-verse'>(defaultViewMode)

  // Load user's preferred translation on mount
  useEffect(() => {
    async function loadPreferredTranslation() {
      if (usePreferredTranslation) {
        const preferredTranslation = await getUserPreferredTranslation()
        setSelectedVersion(preferredTranslation)
      }
    }
    loadPreferredTranslation()
  }, [usePreferredTranslation])

  // Handle translation change and save preference
  const handleTranslationChange = async (newTranslation: TranslationKey) => {
    setSelectedVersion(newTranslation)
    if (usePreferredTranslation) {
      await saveUserPreferredTranslation(newTranslation)
    }
  }

  useEffect(() => {
    async function loadVerses() {
      setLoading(true)
      setError(false)

      try {
        // Split by comma to handle multiple references
        const references = reference.split(',').map(ref => ref.trim()).filter(ref => ref.length > 0)

        // Fetch paragraph format
        const results = await Promise.all(
          references.map(ref => getBibleVerse(ref, selectedVersion))
        )
        const validResults = results.filter(result => result !== null) as VerseData[]

        // Fetch verse-by-verse format (only for single reference, not comma-separated)
        if (!truncate && references.length === 1) {
          const individualResult = await getBibleVersesIndividually(references[0], selectedVersion)
          if (individualResult) {
            setIndividualVerses(individualResult.verses)
          } else {
            setIndividualVerses([])
          }
        } else {
          setIndividualVerses([])
        }

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
  }, [reference, selectedVersion, truncate])

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
    const combinedText = verses.map(v => parseBibleText(v.text, selectedVersion)).join(' ... ')
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
              {verses.map(v => v.reference).join(', ')} ({selectedVersion})
            </p>
          </div>
        </div>
      </div>
    )
  }
  debugger
  // For full view, display each verse separately with optional version selector
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {showVersionSelector && (
          <div className="flex items-center gap-2">
            <label htmlFor="version-select" className="text-sm font-medium text-gray-700">
              Bible Version:
            </label>
            <div className="relative">
              <select
                id="version-select"
                value={selectedVersion}
                onChange={(e) => handleTranslationChange(e.target.value as TranslationKey)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
              >
                {AVAILABLE_VERSIONS.map((version) => (
                  <option key={version.value} value={version.value}>
                    {version.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
          </div>
        )}

        {showViewModeToggle && individualVerses.length > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
              <button
                onClick={() => setViewMode('paragraph')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'paragraph'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <AlignLeft className="h-4 w-4" />
                Paragraph
              </button>
              <button
                onClick={() => setViewMode('verse-by-verse')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'verse-by-verse'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <List className="h-4 w-4" />
                By Verse
              </button>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'verse-by-verse' && individualVerses.length > 0 ? (
        <VerseByVerseView
          reference={reference}
          verses={individualVerses}
          selectedVersion={selectedVersion}
        />
      ) : (
        <ParagraphView
          verses={verses}
          selectedVersion={selectedVersion}
        />
      )}
    </div>
  )
}
