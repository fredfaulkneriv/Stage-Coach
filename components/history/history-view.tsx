'use client'

import Link from 'next/link'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { Session, SpeechProfile } from '@/lib/types'

interface HistoryViewProps {
  sessions: Session[]
  speechProfile: SpeechProfile
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return s === 0 ? `${m}m` : `${m}m ${s}s`
}

function ScoreChip({ score }: { score: number | null }) {
  if (score == null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--error)'
  return (
    <span
      style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        fontSize: '1.25rem',
        color,
      }}
    >
      {score}
    </span>
  )
}

export function HistoryView({ sessions, speechProfile }: HistoryViewProps) {
  const chartData = [...sessions]
    .slice(0, 20)
    .reverse()
    .map((s, i) => ({
      session: i + 1,
      score:
        speechProfile === 'stutter_aware' && s.clarity_score != null && s.structure_score != null
          ? Math.round((s.clarity_score + s.structure_score) / 2)
          : s.overall_score,
      date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))

  return (
    <div style={{ paddingTop: '0.75rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Session History</h1>

      {sessions.length === 0 ? (
        <div
          className="card"
          style={{ padding: '2rem', textAlign: 'center' }}
        >
          <p style={{ color: 'var(--text-muted)' }}>No sessions yet.</p>
          <Link href="/session/new" style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
            Start your first session →
          </Link>
        </div>
      ) : (
        <>
          {/* Score trend chart */}
          {chartData.length > 1 && (
            <div
              className="card"
              style={{ padding: '1rem', marginBottom: '1.5rem' }}
            >
              <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Score Trend
              </h2>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF08" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#8896A7', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#8896A7', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      fontSize: 12,
                      color: 'var(--text-primary)',
                    }}
                    formatter={(val) => [`${val}`, 'Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ fill: 'var(--accent)', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Session list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map((session) => {
              const displayScore =
                speechProfile === 'stutter_aware' &&
                session.clarity_score != null &&
                session.structure_score != null
                  ? Math.round((session.clarity_score + session.structure_score) / 2)
                  : session.overall_score

              return (
                <Link
                  key={session.id}
                  href={`/session/${session.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="card"
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      transition: 'border-color 0.15s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)33'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          marginBottom: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {session.topic ?? 'Freestyle'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(session.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        · {formatDuration(session.duration_seconds)} ·{' '}
                        <span style={{ textTransform: 'capitalize' }}>{session.mode}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <ScoreChip score={displayScore} />
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        +{session.xp_earned} XP
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
