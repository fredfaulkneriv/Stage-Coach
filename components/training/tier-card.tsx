'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import type { ArticulationTier } from '@/lib/types'
import { TIER_INFO } from '@/lib/articulation-exercises'

interface TierCardProps {
  tier: ArticulationTier
  completedExercises: number
  totalExercises: number
  unlocked: boolean
}

export function TierCard({ tier, completedExercises, totalExercises, unlocked }: TierCardProps) {
  const info = TIER_INFO[tier]
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0
  const isComplete = completedExercises >= totalExercises && totalExercises > 0

  const content = (
    <div
      className="card"
      style={{
        padding: '1.25rem',
        opacity: unlocked ? 1 : 0.5,
        cursor: unlocked ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: '1.5rem' }}>{info.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {isComplete && (
              <span
                style={{
                  fontSize: '0.65rem',
                  background: '#10B98130',
                  color: '#10B981',
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontWeight: 600,
                }}
              >
                Complete
              </span>
            )}
          </div>
          <h3
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            {info.name}
          </h3>
        </div>
        {!unlocked && <Lock size={20} color="var(--text-muted)" />}
      </div>

      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          margin: '0 0 12px 0',
          lineHeight: 1.5,
        }}
      >
        {info.theme}
      </p>

      {/* Progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: '#FFFFFF08',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              borderRadius: 3,
              background: isComplete ? '#10B981' : 'var(--accent)',
              transition: 'width 0.5s ease-out',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            fontWeight: 500,
            minWidth: 40,
            textAlign: 'right',
          }}
        >
          {completedExercises}/{totalExercises}
        </span>
      </div>
    </div>
  )

  if (!unlocked) return content

  return (
    <Link href={`/train/${tier}`} style={{ textDecoration: 'none', display: 'block' }}>
      {content}
    </Link>
  )
}
