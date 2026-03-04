import { NextResponse } from 'next/server'
import { SINGLE_USER_ID } from '@/lib/auth'
import { d1Query } from '@/lib/db'
import { TIER_INFO } from '@/lib/articulation-exercises'
import type { ArticulationTier } from '@/lib/types'

interface TierProgress {
  tier: ArticulationTier
  name: string
  theme: string
  completed_exercises: number
  unlocked: boolean
  total_xp: number
}

export async function GET() {
  try {
    // Count distinct passed exercises per tier
    const tierCounts = await d1Query<{ tier: number; cnt: number; total_xp: number }>(
      `SELECT tier, COUNT(DISTINCT exercise_id) as cnt, SUM(xp_earned) as total_xp
       FROM articulation_progress
       WHERE user_id = ? AND score >= 60
       GROUP BY tier`,
      [SINGLE_USER_ID]
    )

    const tierMap = new Map(tierCounts.map((t) => [t.tier, { cnt: t.cnt, xp: t.total_xp }]))

    // Build tier progress
    const tiers: TierProgress[] = ([1, 2, 3, 4, 5] as ArticulationTier[]).map((tier) => {
      const info = TIER_INFO[tier]
      const data = tierMap.get(tier)
      const completedExercises = data?.cnt ?? 0

      // Tier 1 is always unlocked; others require previous tier to have 5+ exercises passed
      let unlocked = tier === 1
      if (tier > 1) {
        const prevData = tierMap.get((tier - 1) as ArticulationTier)
        unlocked = (prevData?.cnt ?? 0) >= 5
      }

      return {
        tier,
        name: info.name,
        theme: info.theme,
        completed_exercises: completedExercises,
        unlocked,
        total_xp: data?.xp ?? 0,
      }
    })

    // Get completed exercise IDs for the frontend
    const completedExercises = await d1Query<{ exercise_id: string; score: number }>(
      `SELECT exercise_id, MAX(score) as score
       FROM articulation_progress
       WHERE user_id = ?
       GROUP BY exercise_id`,
      [SINGLE_USER_ID]
    )

    // Total stats
    const totalExercises = completedExercises.length
    const totalXP = tiers.reduce((sum, t) => sum + t.total_xp, 0)
    const highestTier = tiers.filter((t) => t.unlocked).length

    return NextResponse.json({
      success: true,
      data: {
        tiers,
        completed_exercises: completedExercises,
        stats: {
          total_exercises: totalExercises,
          total_xp: totalXP,
          highest_unlocked_tier: highestTier,
        },
      },
    })
  } catch (error) {
    console.error('Articulation progress error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load progress' },
      { status: 500 }
    )
  }
}
