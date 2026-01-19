import { createClient } from '@/utils/supabase/server'
import { CreatePlanForm } from './create-plan-form'
import { PlanList } from './plan-list'

export default async function PlansPage() {
  const supabase = await createClient()

  const { data: plans, error } = await supabase
    .from('reading_plans')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading plans: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reading Plans</h2>
        <p className="text-sm sm:text-base text-gray-600">Manage your reading plans and daily content</p>
      </div>

      <CreatePlanForm />

      <PlanList plans={plans || []} />
    </div>
  )
}
