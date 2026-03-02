'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, RotateCcw, Star, TrendingUp, Lightbulb } from 'lucide-react'
import { ScoreRing, SmallScoreCard } from '@/components/ui/score-ring'
import { BadgeMini } from '@/components/ui/badge-card'
import { LevelBar } from '@/components/ui/level-bar'
import type { Badge, CoachingFeedbackItem, GuidedDrillType, Session, User } from '@/lib/types'

const DRILL_NAMES: Record<GuidedDrillType, string> = {
  hook: 'The Hook',
  three_point: 'The Three-Point',
  star_story: 'The STAR Story',
  strong_close: 'The Strong Close',
  prep_response: 'The PREP Response',
}

interface ScorecardViewProps {
  session: Session
  user: User
  recentBadges: Badge[]
  isNew: boolean
}

const FEEDBACK_STYLES: Record<
  CoachingFeedbackItem['type'],
  { borderColor: string; icon: React.ReactNode; label: string }
> = {
  strength: {
    borderColor: 'var(--success)',
    icon: <Star size={14} color="var(--success)" />,
    label: 'Strength',
  },
  improvement: {
    borderColor: 'var(--warning)',
    icon: <TrendingUp size={14} color="var(--warning)" />,
    label: 'Improvement',
  },
  tip: {
    borderColor: 'var(--accent)',
    icon: <Lightbulb size={14} color="var(--accent)" />,
    label: 'Tip',
  },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export function ScorecardView({ session, user, recentBadges, isNew }: ScorecardViewProps) {
  const router = useRouter()
  const [badgesVisible, setBadgesVisible] = useState(false)

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setBadgesVisible(true), 800)
      return () => clearTimeout(t)
    } else {
      setBadgesVisible(true)
    }
  }, [isNew])

  const isStutterAware = user.speech_profile === 'stutter_aware'

  // For stutter_aware, overall score is avg of clarity + structure
  const displayScore =
    isStutterAware && session.clarity_score != null && session.structure_score != null
      ? Math.round((session.clarity_score + session.structure_score) / 2)
      : (session.overall_score ?? 0)

  return (
    <div style={{ paddingTop: '0.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Session Complete
          </p>
          {session.mode === 'guided' && (
            <span
              style={{
                fontSize: '0.65rem',
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                color: 'var(--accent)',
                background: 'var(--accent-muted)',
                border: '1px solid var(--accent)33',
                padding: '1px 8px',
                borderRadius: 99,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Guided Drill
            </span>
          )}
        </div>
        <h1 style={{ fontSize: '1.375rem', lineHeight: 1.3 }}>
          {session.mode === 'guided' && session.guided_drill
            ? DRILL_NAMES[session.guided_drill as GuidedDrillType] ?? session.topic ?? 'Guided Session'
            : session.topic ?? 'Freestyle Session'}
        </h1>
        {session.mode === 'guided' && session.topic && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 2 }}>
            {session.topic}
          </p>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
          {formatDuration(session.duration_seconds)} ·{' '}
          {new Date(session.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Overall score ring */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <ScoreRing score={displayScore} size={160} label="Overall" />
      </div>

      {/* XP earned */}
      {isNew && session.xp_earned > 0 && (
        <div
          className="animate-fade-in"
          style={{
            textAlign: 'center',
            marginBottom: '1.25rem',
            padding: '0.625rem 1rem',
            background: 'var(--accent-muted)',
            border: '1px solid var(--accent)33',
            borderRadius: '0.75rem',
            fontSize: '0.9375rem',
            color: 'var(--accent)',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
          }}
        >
          +{session.xp_earned} XP earned
        </div>
      )}

      {/* Level progress */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <LevelBar xp={user.xp} />
      </div>

      {/* Score sub-cards */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <SmallScoreCard label="Pacing" score={session.pacing_score} />
        <SmallScoreCard label="Clarity" score={session.clarity_score} />
        <SmallScoreCard label="Structure" score={session.structure_score} />
        {!isStutterAware && (
          <SmallScoreCard
            label={`Fillers${session.filler_word_count != null ? ` (${session.filler_word_count})` : ''}`}
            score={
              session.filler_word_percentage != null
                ? Math.max(0, 100 - Math.round(session.filler_word_percentage * 5))
                : null
            }
          />
        )}
      </div>

      {/* WPM + Filler pills — standard only */}
      {!isStutterAware && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          {session.wpm != null && (
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Speaking pace
                </span>
                <span
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    color:
                      session.wpm >= 120 && session.wpm <= 160
                        ? 'var(--success)'
                        : 'var(--warning)',
                  }}
                >
                  {Math.round(session.wpm)} WPM
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Ideal range: 120–160 WPM
              </p>
            </div>
          )}

          {session.filler_words_found && session.filler_words_found.length > 0 && (
            <div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Filler words detected:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {session.filler_words_found.map((word, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '2px 10px',
                      background: '#F59E0B22',
                      border: '1px solid #F59E0B44',
                      borderRadius: 99,
                      fontSize: '0.8rem',
                      color: 'var(--warning)',
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coaching feedback */}
      {session.coaching_feedback && session.coaching_feedback.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 10 }}>Coaching Feedback</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {session.coaching_feedback.map((item, i) => {
              const style = FEEDBACK_STYLES[item.type]
              return (
                <div
                  key={i}
                  style={{
                    padding: '0.875rem 1rem',
                    background: 'var(--bg-card)',
                    borderRadius: '0.75rem',
                    borderLeft: `3px solid ${style.borderColor}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginBottom: 5,
                    }}
                  >
                    {style.icon}
                    <span
                      style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {style.label}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                    {item.message}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {session.summary && (
        <div
          className="card"
          style={{
            padding: '1rem',
            marginBottom: '1.25rem',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            Session Summary
          </p>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>{session.summary}</p>
        </div>
      )}

      {/* New badges */}
      {recentBadges.length > 0 && badgesVisible && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: 10 }}>Badges Earned</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentBadges.map((badge) => (
              <div
                key={badge.id}
                className={isNew ? 'animate-badge-earn' : ''}
              >
                <BadgeMini badge={badge} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '2rem' }}>
        <button
          className="btn-secondary"
          style={{ flex: 1 }}
          onClick={() => router.push('/session/new')}
        >
          <RotateCcw size={16} />
          Practice Again
        </button>
        <Link href="/history" style={{ flex: 1, textDecoration: 'none' }}>
          <button className="btn-primary" style={{ width: '100%' }}>
            View History
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  )
}
