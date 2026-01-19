import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { toggleProgress, subscribeToPlan, unsubscribeFromPlan } from './actions'
import { SubscribeButton } from './subscribe-button'

export default async function Dashboard() {
  const supabase = await createClient()

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. Get user's subscriptions
  const { data: subscriptions } = await supabase
    .from('plan_subscriptions')
    .select('plan_id')
    .eq('user_id', user.id)

  const subscribedPlanIds = subscriptions?.map(s => s.plan_id) || []

  // 3. Fetch all reading plans
  const { data: allPlans } = await supabase
    .from('reading_plans')
    .select('*')
    .order('created_at', { ascending: false })

  // 4. If user has subscriptions, fetch their plan days with progress
  let planDays = null
  let currentPlan = null

  if (subscribedPlanIds.length > 0) {
    // For now, show the first subscribed plan
    const activePlanId = subscribedPlanIds[0]

    const { data: plan } = await supabase
      .from('reading_plans')
      .select('*')
      .eq('id', activePlanId)
      .single()

    currentPlan = plan

    const { data: days } = await supabase
      .from('plan_days')
      .select(`
        *,
        user_progress(is_completed)
      `)
      .eq('plan_id', activePlanId)
      .order('day_number', { ascending: true })

    planDays = days
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pt-6 sm:pt-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Building for the next 5, 50, and 500 years.</p>
        </header>

        {/* Show available plans if user has no subscription */}
        {subscribedPlanIds.length === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Available Reading Plans</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Choose a reading plan to begin your journey</p>
            </div>

            {allPlans && allPlans.length > 0 ? (
              <div className="space-y-4">
                {allPlans.map((plan) => (
                  <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{plan.title}</h3>
                        {plan.description && (
                          <p className="text-sm sm:text-base text-gray-600 mb-4">{plan.description}</p>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500">
                          Created {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <SubscribeButton planId={plan.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-600">No reading plans available yet. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        {/* Show current plan and daily readings if subscribed */}
        {subscribedPlanIds.length > 0 && currentPlan && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{currentPlan.title}</h2>
                  {currentPlan.description && (
                    <p className="text-sm sm:text-base text-gray-600">{currentPlan.description}</p>
                  )}
                </div>
                <form action={async () => {
                  'use server'
                  await unsubscribeFromPlan(currentPlan.id)
                }}>
                  <button className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium whitespace-nowrap">
                    Unsubscribe
                  </button>
                </form>
              </div>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Your Reading Progress</h3>
              <div className="space-y-3 sm:space-y-4">
                {planDays && planDays.length > 0 ? (
                  planDays.map((day: any) => {
                    const isCompleted = day.user_progress?.[0]?.is_completed || false

                    return (
                      <div key={day.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900">Day {day.day_number}: {day.scripture_reference}</h3>
                          {day.content_markdown && <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1">{day.content_markdown}</p>}
                        </div>

                        <form action={toggleProgress}>
                          <input type="hidden" name="day_id" value={day.id} />
                          <input type="hidden" name="current_status" value={String(isCompleted)} />
                          <button
                            className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap ${isCompleted
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                          >
                            {isCompleted ? 'Completed' : 'Mark as Read'}
                          </button>
                        </form>
                      </div>
                    )
                  })
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 sm:p-12 text-center">
                    <p className="text-sm sm:text-base text-gray-600">No daily readings available yet for this plan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}