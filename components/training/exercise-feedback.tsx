'use client'

import Link from 'next/link'
import { CheckCircle2, AlertCircle, Sparkles, Trophy, ArrowRight, RotateCcw } from 'lucide-react'
import { ScoreRing } from '@/components/ui/score-ring'
import type { ArticulationFeedback, ArticulationTier, Badge } from '@/lib/types'

interface ExerciseFeedbackProps {
  feedback: ArticulationFeedback
  xpEarned: number
  newLevel: string | null
  newBadges: Badge[]
  tierJustCompleted: boolean
  exerciseTier: ArticulationTier
  userResponse: string
}

export function ExerciseFeedback({
  feedback,
  xpEarned,
  newLevel,
  newBadges,
  tierJustCompleted,
  exerciseTier,
  userResponse,
}: ExerciseFeedbackProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
      {/* Score ring */}
      <ScoreRing score={feedback.score} size={140} label="Score" />

      {/* XP earned */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--accent)',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '1rem',
        }}
      >
        <Sparkles size={16} />
        +{xpEarned} XP
      </div>

      {/* Level up */}
      {newLevel && (
        <div
          className="card"
          style={{
            padding: '1rem',
            width: '100%',
            textAlign: 'center',
            background: '#10B98118',
            border: '1px solid #10B98130',
          }}
        >
          <p
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: '#10B981',
              margin: 0,
            }}
          >
            Level Up! You&apos;re now {newLevel}
          </p>
        </div>
      )}

      {/* Tier completed */}
      {tierJustCompleted && (
        <div
          className="card"
          style={{
            padding: '1rem',
            width: '100%',
            textAlign: 'center',
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent)',
          }}
        >
          <Trophy size={24} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
          <p
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              color: 'var(--accent)',
              margin: 0,
            }}
          >
            Tier {exerciseTier} Complete!
          </p>
          {exerciseTier < 5 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Tier {exerciseTier + 1} is now unlocked.
            </p>
          )}
        </div>
      )}

      {/* New badges */}
      {newBadges.length > 0 && (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {newBadges.map((badge) => (
            <div
              key={badge.id}
              className="card"
              style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#F59E0B10',
                border: '1px solid #F59E0B30',
              }}
            >
              <Trophy size={20} color="#F59E0B" />
              <div>
                <p
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#F59E0B',
                    margin: 0,
                  }}
                >
                  {badge.badge_name}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {badge.badge_description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div style={{ width: '100%' }}>
          {feedback.strengths.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 0',
                borderBottom: i < feedback.strengths.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div style={{ width: '100%' }}>
          {feedback.improvements.map((s, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 10,
                padding: '10px 0',
                borderBottom: i < feedback.improvements.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              }}
            >
              <AlertCircle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* Example response */}
      {feedback.example_response && (
        <div
          className="card"
          style={{
            padding: '1rem',
            width: '100%',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <p
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              margin: '0 0 6px 0',
            }}
          >
            Example Strong Response
          </p>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-primary)',
              margin: 0,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            {feedback.example_response}
          </p>
        </div>
      )}

      {/* Principle */}
      <div
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.75rem',
          background: 'var(--accent-muted)',
        }}
      >
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--accent)',
            margin: 0,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {feedback.principle_reinforced}
        </p>
      </div>

      {/* Actions */}
      <div style={{ width: '100%', display: 'flex', gap: 10 }}>
        <Link
          href={`/train/${exerciseTier}`}
          style={{
            flex: 1,
            textDecoration: 'none',
          }}
        >
          <button
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: '0.75rem',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            Next Exercise
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  )
}
