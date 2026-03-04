'use client'

import Link from 'next/link'
import { CheckCircle2, Mic } from 'lucide-react'
import type { ArticulationExercise } from '@/lib/types'
import { EXERCISE_TYPE_INFO } from '@/lib/articulation-exercises'

interface ExerciseCardProps {
  exercise: ArticulationExercise
  bestScore: number | null
  passed: boolean
}

export function ExerciseCard({ exercise, bestScore, passed }: ExerciseCardProps) {
  const typeInfo = EXERCISE_TYPE_INFO[exercise.type]
  const difficultyStars = Array.from({ length: 3 }, (_, i) => i < exercise.difficultyLevel)

  return (
    <Link
      href={`/train/exercise?id=${exercise.id}`}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className="card"
        style={{
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          transition: 'transform 0.15s',
        }}
      >
        {/* Type icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: passed ? '#10B98118' : 'var(--accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1.2rem',
          }}
        >
          {typeInfo.emoji}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
              }}
            >
              {exercise.title}
            </span>
            {typeInfo.isSpoken && (
              <Mic size={13} color="var(--accent)" style={{ flexShrink: 0 }} />
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              {typeInfo.name}
            </span>
            <span style={{ display: 'flex', gap: 2 }}>
              {difficultyStars.map((filled, i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: filled ? 'var(--accent)' : '#FFFFFF15',
                  }}
                />
              ))}
            </span>
          </div>
        </div>

        {/* Score / Status */}
        {passed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#10B981',
              }}
            >
              {bestScore}
            </span>
            <CheckCircle2 size={18} color="#10B981" />
          </div>
        ) : bestScore != null ? (
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: bestScore >= 60 ? '#F59E0B' : '#EF4444',
            }}
          >
            {bestScore}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
