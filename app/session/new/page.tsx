'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Mic, Lock } from 'lucide-react'

const SUGGESTED_TOPICS = [
  "Explain your work to someone who doesn't know your industry",
  'Describe a challenge you overcame and what you learned',
  'Make the case for something you believe in',
  'Walk someone through a process you know well',
  'Tell a story that changed how you think about something',
]

const DURATIONS = [
  { value: 60, label: '1 min' },
  { value: 120, label: '2 min' },
  { value: 180, label: '3 min' },
  { value: 300, label: '5 min' },
]

const MODES = [
  { value: 'freestyle', label: 'Freestyle', description: 'Speak freely on any topic', available: true },
  { value: 'guided', label: 'Guided Drills', description: 'Structured exercises', available: false },
  { value: 'mirror', label: 'Mirror Mode', description: 'See yourself speak', available: false },
  { value: 'presentation_sim', label: 'Presentation Sim', description: 'Full run-through', available: false },
  { value: 'hot_seat', label: 'Hot Seat', description: 'Live Q&A practice', available: false },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState('freestyle')
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(120)

  function handleBegin() {
    const params = new URLSearchParams()
    if (topic) params.set('topic', topic)
    params.set('duration', String(duration))
    router.push(`/session/record?${params.toString()}`)
  }

  return (
    <AppShell>
      <div style={{ paddingTop: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>New Session</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
          Set up your practice session.
        </p>

        {/* Mode selector */}
        <section style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Mode
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MODES.map(({ value, label, description, available }) => (
              <button
                key={value}
                onClick={() => available && setSelectedMode(value)}
                disabled={!available}
                style={{
                  padding: '0.875rem 1rem',
                  background: selectedMode === value ? 'var(--accent-muted)' : 'var(--bg-card)',
                  border: `1.5px solid ${selectedMode === value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  borderRadius: '0.75rem',
                  cursor: available ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  opacity: !available ? 0.6 : 1,
                  transition: 'all 0.15s',
                }}
              >
                <Mic
                  size={18}
                  color={selectedMode === value ? 'var(--accent)' : 'var(--text-muted)'}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontFamily: 'Syne, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.9375rem',
                      color: selectedMode === value ? 'var(--accent)' : 'var(--text-primary)',
                    }}
                  >
                    {label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {description}
                  </div>
                </div>
                {!available && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-muted)',
                      padding: '2px 8px',
                      borderRadius: 99,
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Lock size={10} />
                    Coming Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Topic input */}
        <section style={{ marginBottom: '1.75rem' }}>
          <h2
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Topic <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </h2>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What will you speak about?"
            rows={2}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0.75rem',
              color: 'var(--text-primary)',
              fontSize: '0.9375rem',
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
              resize: 'none',
              marginBottom: 10,
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suggestions:</span>
            {SUGGESTED_TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'color 0.15s, border-color 0.15s',
                  fontFamily: 'DM Sans, sans-serif',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.color = 'var(--text-primary)'
                  el.style.borderColor = 'var(--accent)33'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.color = 'var(--text-muted)'
                  el.style.borderColor = 'var(--border-subtle)'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Duration selector */}
        <section style={{ marginBottom: '2rem' }}>
          <h2
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Duration
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {DURATIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setDuration(value)}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: duration === value ? 'var(--accent)' : 'var(--bg-card)',
                  border: `1.5px solid ${duration === value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                  borderRadius: '0.75rem',
                  color: duration === value ? '#0F1B2D' : 'var(--text-primary)',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  minHeight: 44,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <button className="btn-primary" onClick={handleBegin} style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}>
          Begin Session
        </button>
      </div>
    </AppShell>
  )
}
