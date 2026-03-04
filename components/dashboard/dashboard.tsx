'use client'

import Link from 'next/link'
import { Flame, Mic, BookOpen, ArrowRight } from 'lucide-react'
import { LevelBar } from '@/components/ui/level-bar'
import { BadgeMini } from '@/components/ui/badge-card'
import type { Badge, CoachingFeedbackItem, Session, User } from '@/lib/types'

interface DashboardProps {
  user: User
  lastSession: Session | null
  recentBadges: Badge[]
  articulationProgress?: { highest_tier: number; total_exercises: number }
}

function getFirstName(name: string): string {
  return name.split(' ')[0]
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function ScoreColor({ score }: { score: number }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)'
  return (
    <span style={{ color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.75rem' }}>
      {score}
    </span>
  )
}

export function Dashboard({ user, lastSession, recentBadges, articulationProgress }: DashboardProps) {
  const hasStreak = user.current_streak > 0
  const streakIsHot = user.current_streak >= 7

  return (
    <div style={{ paddingTop: '0.75rem' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{getGreeting()},</p>
        <h1 style={{ fontSize: '1.75rem', lineHeight: 1.2 }}>{getFirstName(user.name)}</h1>
      </div>

      {/* Streak + Level row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.25rem' }}>
        {/* Streak card */}
        <div
          className="card"
          style={{
            padding: '1rem',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Flame
            size={28}
            color="var(--warning)"
            className={streakIsHot ? 'animate-flicker' : ''}
          />
          <div>
            <div
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '1.5rem',
                color: hasStreak ? 'var(--warning)' : 'var(--text-muted)',
                lineHeight: 1,
              }}
            >
              {user.current_streak}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user.current_streak === 1 ? 'day streak' : 'day streak'}
            </div>
          </div>
        </div>

        {/* Level card */}
        <div
          className="card"
          style={{
            padding: '1rem',
            flex: 2,
          }}
        >
          <LevelBar xp={user.xp} />
        </div>
      </div>

      {/* Start Session CTA */}
      <Link href="/session/new" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.25rem' }}>
        <button
          className="btn-primary"
          style={{ width: '100%', padding: '1.125rem', fontSize: '1.0625rem', borderRadius: '1rem' }}
        >
          <Mic size={20} />
          Start Session
        </button>
      </Link>

      {/* Articulation Training card */}
      <Link href="/train" style={{ textDecoration: 'none', display: 'block', marginBottom: '1.25rem' }}>
        <div
          className="card"
          style={{
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'var(--accent-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={22} color="var(--accent)" />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Articulation Training
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              {articulationProgress && articulationProgress.total_exercises > 0
                ? `Tier ${articulationProgress.highest_tier} · ${articulationProgress.total_exercises} exercises done`
                : 'Sharpen your language skills'}
            </p>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
        </div>
      </Link>

      {/* Last session card */}
      {lastSession ? (
        <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                Last session
              </p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.3 }}>
                {lastSession.topic ?? 'Freestyle'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {new Date(lastSession.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            {lastSession.overall_score != null && (
              <ScoreColor score={lastSession.overall_score} />
            )}
          </div>

          {/* Top feedback item */}
          {lastSession.coaching_feedback && lastSession.coaching_feedback.length > 0 && (
            <p
              style={{
                fontSize: '0.8375rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              {(lastSession.coaching_feedback as CoachingFeedbackItem[])[0]?.message}
            </p>
          )}

          <Link
            href={`/session/${lastSession.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              marginTop: '0.75rem',
              fontSize: '0.8125rem',
              color: 'var(--accent)',
              textDecoration: 'none',
            }}
          >
            View full scorecard <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: '1.5rem',
            marginBottom: '1.25rem',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', marginBottom: 4 }}>
            No sessions yet
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Start your first session to see your scorecard here.
          </p>
        </div>
      )}

      {/* Recent badges */}
      {recentBadges.length > 0 && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <h2 style={{ fontSize: '1rem' }}>Recent Badges</h2>
            <Link
              href="/profile"
              style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none' }}
            >
              See all
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentBadges.map((badge) => (
              <BadgeMini key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
