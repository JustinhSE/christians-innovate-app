import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { CreateDayForm } from './create-day-form'
import { DayList } from './day-list'

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the plan
  const { data: plan, error: planError } = await supabase
    .from('reading_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (planError || !plan) {
    notFound()
  }

  // Fetch all days for this plan
  const { data: days, error: daysError } = await supabase
    .from('plan_days')
    .select('*')
    .eq('plan_id', id)
    .order('day_number', { ascending: true })

  if (daysError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading days: {daysError.message}
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <a
          href="/admin/plans"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Plans
        </a>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{plan.title}</h2>
            {plan.description && (
              <p className="text-sm sm:text-base text-gray-600">{plan.description}</p>
            )}
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              {days?.length || 0} day{days?.length !== 1 ? 's' : ''} in this plan
            </p>
          </div>
        </div>
      </div>

      {/* Create Day Form */}
      <CreateDayForm planId={id} />

      {/* Days List */}
      <DayList days={days || []} planId={id} />
    </div>
  )
}
