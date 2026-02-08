'use server'

import { createClient } from '@/utils/supabase/server'

export type PlanStats = {
  id: string
  title: string
  description: string | null
  total_subscribers: number
  total_days: number
  active_readers: number // users who completed at least one day in last 7 days
  up_to_date_count: number // users who have completed all days up to today
  average_completion_rate: number // average % of days completed across all subscribers
}

export async function getPlanStatistics() {
  const supabase = await createClient()

  // Get all plans with subscriber counts and day counts
  const { data: plans, error: plansError } = await supabase
    .from('reading_plans')
    .select(`
      id,
      title,
      description,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (plansError) {
    console.error('Error fetching plans:', plansError)
    return { error: plansError.message }
  }

  if (!plans || plans.length === 0) {
    return { data: [] }
  }

  // Get statistics for each plan
  const planStats: PlanStats[] = await Promise.all(
    plans.map(async (plan) => {
      // Get total subscribers
      const { count: subscriberCount } = await supabase
        .from('plan_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', plan.id)

      // Get total days in the plan
      const { count: daysCount } = await supabase
        .from('plan_days')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', plan.id)

      // Get the highest day number to determine "current" day
      const { data: maxDayData } = await supabase
        .from('plan_days')
        .select('day_number')
        .eq('plan_id', plan.id)
        .order('day_number', { ascending: false })
        .limit(1)
        .single()

      const totalDays = maxDayData?.day_number || daysCount || 0

      // Get active readers (completed at least one day in last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: activeReadersData } = await supabase
        .from('user_progress')
        .select('user_id')
        .gte('completed_at', sevenDaysAgo.toISOString())
        .in(
          'day_id',
          (await supabase
            .from('plan_days')
            .select('id')
            .eq('plan_id', plan.id)
          ).data?.map((d) => d.id) || []
        )

      const activeReaders = new Set(activeReadersData?.map((r) => r.user_id) || []).size

      // Get users who are up to date
      // "Up to date" means they've completed all days up to the current day number
      // For simplicity, we'll check users who have completed all existing days
      const { data: subscribers } = await supabase
        .from('plan_subscriptions')
        .select('user_id')
        .eq('plan_id', plan.id)

      let upToDateCount = 0
      let totalCompletionRate = 0

      if (subscribers && subscribers.length > 0) {
        for (const subscriber of subscribers) {
          // Get all days for this plan
          const { data: planDays } = await supabase
            .from('plan_days')
            .select('id')
            .eq('plan_id', plan.id)

          if (!planDays || planDays.length === 0) continue

          // Get completed days for this user
          const { data: completedDays } = await supabase
            .from('user_progress')
            .select('day_id')
            .eq('user_id', subscriber.user_id)
            .in('day_id', planDays.map((d) => d.id))

          const completedCount = completedDays?.length || 0
          const completionRate = totalDays > 0 ? (completedCount / totalDays) * 100 : 0
          totalCompletionRate += completionRate

          // Consider "up to date" if they've completed at least 80% of days
          // or all available days
          if (completedCount >= planDays.length || completionRate >= 80) {
            upToDateCount++
          }
        }
      }

      const averageCompletionRate =
        subscribers && subscribers.length > 0
          ? totalCompletionRate / subscribers.length
          : 0

      return {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        total_subscribers: subscriberCount || 0,
        total_days: totalDays,
        active_readers: activeReaders,
        up_to_date_count: upToDateCount,
        average_completion_rate: Math.round(averageCompletionRate),
      }
    })
  )

  return { data: planStats }
}

export async function getOverallStats() {
  const supabase = await createClient()

  // Get total number of unique subscribers across all plans
  const { data: allSubscribers } = await supabase
    .from('plan_subscriptions')
    .select('user_id')

  const totalUniqueSubscribers = new Set(
    allSubscribers?.map((s) => s.user_id) || []
  ).size

  // Get total number of plans
  const { count: totalPlans } = await supabase
    .from('reading_plans')
    .select('*', { count: 'exact', head: true })

  // Get total completions in last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentCompletions } = await supabase
    .from('user_progress')
    .select('*', { count: 'exact', head: true })
    .gte('completed_at', sevenDaysAgo.toISOString())

  return {
    totalUniqueSubscribers,
    totalPlans: totalPlans || 0,
    recentCompletions: recentCompletions || 0,
  }
}

export type SubscriberProgress = {
  user_id: string
  full_name: string
  avatar_url: string | null
  subscribed_at: string
  total_days: number
  completed_days: number
  completion_percentage: number
  last_activity: string | null
  current_day: number | null
}

export async function getPlanSubscribers(planId: string) {
  const supabase = await createClient()

  // Get all subscribers for this plan
  const { data: subscriptions, error: subsError } = await supabase
    .from('plan_subscriptions')
    .select('user_id, subscribed_at')
    .eq('plan_id', planId)

  if (subsError) {
    console.error('Error fetching subscriptions:', subsError)
    return { error: subsError.message }
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { data: [] }
  }

  // Get total days in the plan
  const { data: planDays } = await supabase
    .from('plan_days')
    .select('id, day_number')
    .eq('plan_id', planId)
    .order('day_number', { ascending: true })

  const totalDays = planDays?.length || 0
  const planDayIds = planDays?.map((d) => d.id) || []

  // Get subscriber progress
  const subscriberProgress: SubscriberProgress[] = await Promise.all(
    subscriptions.map(async (subscription) => {
      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, avatar_url')
        .eq('user_id', subscription.user_id)
        .single()

      // Get completed days for this user in this plan
      const { data: completedDays } = await supabase
        .from('user_progress')
        .select('day_id, completed_at')
        .eq('user_id', subscription.user_id)
        .in('day_id', planDayIds)
        .order('completed_at', { ascending: false })

      const completedCount = completedDays?.length || 0
      const completionPercentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0
      const lastActivity = completedDays?.[0]?.completed_at || null

      // Find current day (next incomplete day)
      const completedDayIds = new Set(completedDays?.map((d) => d.day_id) || [])
      const nextIncompleteDay = planDays?.find((day) => !completedDayIds.has(day.id))

      return {
        user_id: subscription.user_id,
        full_name: profile?.full_name || 'Unknown User',
        avatar_url: profile?.avatar_url || null,
        subscribed_at: subscription.subscribed_at,
        total_days: totalDays,
        completed_days: completedCount,
        completion_percentage: completionPercentage,
        last_activity: lastActivity,
        current_day: nextIncompleteDay?.day_number || null,
      }
    })
  )

  // Sort by completion percentage descending
  subscriberProgress.sort((a, b) => b.completion_percentage - a.completion_percentage)

  return { data: subscriberProgress }
}
