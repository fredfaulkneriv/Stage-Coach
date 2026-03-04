import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { SINGLE_USER_ID } from '@/lib/auth'
import { d1Query } from '@/lib/db'
import {
  getTextExercisesForTier,
  getSpokenExercisesForTier,
  TIER_INFO,
} from '@/lib/articulation-exercises'
import { AppShell } from '@/components/app-shell'
import { ExerciseCard } from '@/components/training/exercise-card'
import type { ArticulationTier } from '@/lib/types'

export default async function TierPage({
  params,
}: {
  params: Promise<{ tier: string }>
}) {
  const { tier: tierParam } = await params
  const tier = parseInt(tierParam, 10) as ArticulationTier
  if (![1, 2, 3, 4, 5].includes(tier)) return notFound()

  const info = TIER_INFO[tier]
  const textExercises = getTextExercisesForTier(tier)
  const spokenExercises = getSpokenExercisesForTier(tier)

  // Check unlock status
  if (tier > 1) {
    const prevTier = await d1Query<{ cnt: number }>(
      `SELECT COUNT(DISTINCT exercise_id) as cnt
       FROM articulation_progress
       WHERE user_id = ? AND tier = ? AND score >= 60`,
      [SINGLE_USER_ID, tier - 1]
    )
    if ((prevTier[0]?.cnt ?? 0) < 5) return notFound()
  }

  // Get user's best scores for each exercise
  const progress = await d1Query<{ exercise_id: string; best_score: number }>(
    `SELECT exercise_id, MAX(score) as best_score
     FROM articulation_progress
     WHERE user_id = ? AND tier = ?
     GROUP BY exercise_id`,
    [SINGLE_USER_ID, tier]
  )
  const scoreMap = new Map(progress.map((p) => [p.exercise_id, p.best_score]))

  return (
    <AppShell>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Back link */}
      <Link
        href="/train"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 500,
        }}
      >
        <ChevronLeft size={16} />
        All Tiers
      </Link>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: '1.5rem' }}>{info.emoji}</span>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Tier {tier}
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '1.4rem',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
          }}
        >
          {info.name}
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {info.description}
        </p>
      </div>

      {/* Text exercises */}
      {textExercises.length > 0 && (
        <div>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 10px 0',
            }}
          >
            Written Exercises
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {textExercises.map((ex) => {
              const bestScore = scoreMap.get(ex.id) ?? null
              return (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  bestScore={bestScore}
                  passed={bestScore != null && bestScore >= 60}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Spoken exercises */}
      {spokenExercises.length > 0 && (
        <div>
          <h2
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 10px 0',
            }}
          >
            Speak Sharp
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {spokenExercises.map((ex) => {
              const bestScore = scoreMap.get(ex.id) ?? null
              return (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  bestScore={bestScore}
                  passed={bestScore != null && bestScore >= 60}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
    </AppShell>
  )
}
