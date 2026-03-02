'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Mic, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import type { GuidedDrill, GuidedDrillType } from '@/lib/types'

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
  { value: 'guided', label: 'Guided Drills', description: 'Practice a specific speech structure', available: true },
  { value: 'mirror', label: 'Mirror Mode', description: 'See yourself speak', available: false },
  { value: 'presentation_sim', label: 'Presentation Sim', description: 'Full run-through', available: false },
  { value: 'hot_seat', label: 'Hot Seat', description: 'Live Q&A practice', available: false },
]

const GUIDED_DRILLS: GuidedDrill[] = [
  {
    type: 'hook',
    name: 'The Hook',
    description: 'Master your opening — grab attention in 30 seconds',
    recommendedDuration: 120,
    steps: [
      { label: 'Grabber', hint: 'Open with a stat, bold question, or 1-sentence story' },
      { label: 'Problem', hint: 'State the tension or problem clearly' },
      { label: 'Relevance', hint: 'Bridge to why this matters to your audience' },
      { label: 'Preview', hint: 'Tell them what you\'re about to cover' },
    ],
  },
  {
    type: 'three_point',
    name: 'The Three-Point',
    description: 'Build a clear, memorable 3-part argument',
    recommendedDuration: 180,
    steps: [
      { label: 'Main message', hint: 'State your thesis in one sentence' },
      { label: 'Point 1', hint: 'Make your first point + give an example' },
      { label: 'Point 2', hint: 'Make your second point + give an example' },
      { label: 'Point 3', hint: 'Make your third point + give an example' },
      { label: 'Summary', hint: 'Restate your main message to close' },
    ],
  },
  {
    type: 'star_story',
    name: 'The STAR Story',
    description: 'Tell a compelling story: Situation → Task → Action → Result',
    recommendedDuration: 180,
    steps: [
      { label: 'Situation', hint: 'Set the scene briefly and vividly' },
      { label: 'Task', hint: 'Explain the challenge or goal you faced' },
      { label: 'Action', hint: 'Describe exactly what YOU did' },
      { label: 'Result', hint: 'Share the outcome + what you learned' },
    ],
  },
  {
    type: 'strong_close',
    name: 'The Strong Close',
    description: 'Land your ending so it sticks',
    recommendedDuration: 120,
    steps: [
      { label: 'Recap', hint: 'Briefly summarize your 2–3 main points' },
      { label: 'Takeaway', hint: 'Give one clear call to action or key lesson' },
      { label: 'Mic drop', hint: 'End with a memorable final line' },
    ],
  },
  {
    type: 'prep_response',
    name: 'The PREP Response',
    description: 'Answer any question confidently: Point → Reason → Example → Point',
    recommendedDuration: 120,
    steps: [
      { label: 'Point', hint: 'State your answer or opinion directly — no warm-up' },
      { label: 'Reason', hint: 'Explain the why behind your answer' },
      { label: 'Example', hint: 'Give a specific story or data point' },
      { label: 'Point', hint: 'Restate your answer to land it cleanly' },
    ],
  },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState('freestyle')
  const [selectedDrill, setSelectedDrill] = useState<GuidedDrillType>('hook')
  const [expandedDrill, setExpandedDrill] = useState<GuidedDrillType | null>(null)
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(120)

  const activeDrill = GUIDED_DRILLS.find((d) => d.type === selectedDrill)!

  function handleBegin() {
    const params = new URLSearchParams()
    if (topic) params.set('topic', topic)
    params.set('duration', String(duration))
    params.set('mode', selectedMode)
    if (selectedMode === 'guided') {
      params.set('drill', selectedDrill)
    }
    router.push(`/session/record?${params.toString()}`)
  }

  function handleModeSelect(value: string) {
    setSelectedMode(value)
    if (value === 'guided') {
      setDuration(activeDrill.recommendedDuration)
    }
  }

  function handleDrillSelect(drill: GuidedDrill) {
    setSelectedDrill(drill.type)
    setDuration(drill.recommendedDuration)
    setExpandedDrill(null)
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
                onClick={() => available && handleModeSelect(value)}
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

        {/* Guided Drill picker — shown only when guided mode is selected */}
        {selectedMode === 'guided' && (
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
              Drill
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {GUIDED_DRILLS.map((drill) => {
                const isSelected = selectedDrill === drill.type
                const isExpanded = expandedDrill === drill.type
                return (
                  <div
                    key={drill.type}
                    style={{
                      background: isSelected ? 'var(--accent-muted)' : 'var(--bg-card)',
                      border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Drill header row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        gap: 10,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleDrillSelect(drill)}
                    >
                      {/* Radio dot */}
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                          background: isSelected ? 'var(--accent)' : 'transparent',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: 'Syne, sans-serif',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                          }}
                        >
                          {drill.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {drill.description}
                        </div>
                      </div>
                      {/* Toggle steps preview */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedDrill(isExpanded ? null : drill.type)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          padding: 4,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                    {/* Expanded steps preview */}
                    {isExpanded && (
                      <div
                        style={{
                          padding: '0 1rem 0.75rem 2.5rem',
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '0.625rem',
                        }}
                      >
                        {drill.steps.map((step, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              gap: 8,
                              marginBottom: i < drill.steps.length - 1 ? 6 : 0,
                              alignItems: 'flex-start',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontFamily: 'Syne, sans-serif',
                                fontWeight: 700,
                                color: 'var(--accent)',
                                minWidth: 16,
                                marginTop: 1,
                              }}
                            >
                              {i + 1}.
                            </span>
                            <div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {step.label}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                                — {step.hint}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

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
            placeholder={
              selectedMode === 'guided'
                ? `What will you practice ${activeDrill.name} on?`
                : 'What will you speak about?'
            }
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
            {selectedMode === 'guided' && (
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: 6 }}>
                (recommended: {activeDrill.recommendedDuration / 60} min)
              </span>
            )}
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
