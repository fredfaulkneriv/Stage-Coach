import { SINGLE_USER_ID } from '@/lib/auth'
import { d1Query } from '@/lib/db'
import { getExercisesForTier, TIER_INFO } from '@/lib/articulation-exercises'
import { AppShell } from '@/components/app-shell'
import { TierCard } from '@/components/training/tier-card'
import type { ArticulationTier } from '@/lib/types'
import { BookOpen } from 'lucide-react'

export default async function TrainPage() {
  // Fetch progress data
  const tierCounts = await d1Query<{ tier: number; cnt: number }>(
    `SELECT tier, COUNT(DISTINCT exercise_id) as cnt
     FROM articulation_progress
     WHERE user_id = ? AND score >= 60
     GROUP BY tier`,
    [SINGLE_USER_ID]
  )
  const tierMap = new Map(tierCounts.map((t) => [t.tier, t.cnt]))

  const tiers: ArticulationTier[] = [1, 2, 3, 4, 5]

  return (
    <AppShell>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: 'var(--accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          <BookOpen size={28} color="var(--accent)" />
        </div>
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '1.5rem',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          Articulation Training
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Sharpen your language. Structure your thoughts. Speak with precision.
        </p>
      </div>

      {/* Tier cards */}
      {tiers.map((tier) => {
        const completed = tierMap.get(tier) ?? 0
        const total = getExercisesForTier(tier).length
        const unlocked =
          tier === 1 || (tierMap.get((tier - 1) as ArticulationTier) ?? 0) >= 5

        return (
          <TierCard
            key={tier}
            tier={tier}
            completedExercises={completed}
            totalExercises={total}
            unlocked={unlocked}
          />
        )
      })}
    </div>
    </AppShell>
  )
}
