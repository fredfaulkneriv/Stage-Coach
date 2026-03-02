'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Check } from 'lucide-react'
import type { CoachingStyle, Goal, SpeechProfile } from '@/lib/types'

const GOALS: { value: Goal; label: string; icon: string }[] = [
  { value: 'conference_speaking', label: 'Conference & keynote speaking', icon: '🎤' },
  { value: 'job_interviews', label: 'Job interviews & pitching', icon: '💼' },
  { value: 'classroom', label: 'Classroom & academic presentations', icon: '📚' },
  { value: 'podcast_hosting', label: 'Podcast & media appearances', icon: '🎙️' },
  { value: 'sales_pitches', label: 'Sales & client presentations', icon: '📈' },
]

const COACHING_STYLES: { value: CoachingStyle; label: string; description: string }[] = [
  { value: 'tough_love', label: 'Tough Love', description: 'Direct feedback, no sugarcoating' },
  { value: 'encouraging', label: 'Encouraging', description: 'Positive reinforcement with gentle guidance' },
  { value: 'data_driven', label: 'Data-Driven', description: 'Numbers and metrics first, feelings second' },
  { value: 'socratic', label: 'Socratic', description: 'Questions that make you think, not just prescriptions' },
]

interface FormData {
  name: string
  goal: Goal | null
  coaching_style: CoachingStyle | null
  speech_profile: SpeechProfile | null
}

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>({
    name: '',
    goal: null,
    coaching_style: null,
    speech_profile: null,
  })

  const canProceed =
    (step === 1 && form.name.trim().length >= 2) ||
    (step === 2 && form.goal != null) ||
    (step === 3 && form.coaching_style != null) ||
    (step === 4 && form.speech_profile != null) ||
    step === 5

  async function handleFinish() {
    if (!form.goal || !form.coaching_style || !form.speech_profile) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          goal: form.goal,
          coaching_style: form.coaching_style,
          speech_profile: form.speech_profile,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  const TOTAL_STEPS = 5

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              height: 4,
              background: 'var(--bg-card)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${(step / TOTAL_STEPS) * 100}%`,
                background: 'var(--accent)',
                borderRadius: 2,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textAlign: 'right',
            }}
          >
            Step {step} of {TOTAL_STEPS}
          </div>
        </div>

        {/* Step 1 — Name */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Let&apos;s set up your coaching profile</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              This helps Stage Coach personalize every session just for you.
            </p>
            <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              What should we call you?
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your first name"
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0.75rem',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>
        )}

        {/* Step 2 — Goal */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>What&apos;s your main goal?</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Choose the speaking context that matters most to you.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {GOALS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, goal: value }))}
                  style={{
                    padding: '1rem 1.25rem',
                    background: form.goal === value ? 'var(--accent-muted)' : 'var(--bg-card)',
                    border: `1.5px solid ${form.goal === value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.9375rem' }}>
                    {label}
                  </span>
                  {form.goal === value && (
                    <Check size={16} color="var(--accent)" style={{ marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Coaching Style */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>How should I coach you?</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              This shapes how feedback is delivered in every session.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {COACHING_STYLES.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, coaching_style: value }))}
                  style={{
                    padding: '1rem 1.25rem',
                    background: form.coaching_style === value ? 'var(--accent-muted)' : 'var(--bg-card)',
                    border: `1.5px solid ${form.coaching_style === value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 700,
                        color: form.coaching_style === value ? 'var(--accent)' : 'var(--text-primary)',
                        marginBottom: 2,
                      }}
                    >
                      {label}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                      {description}
                    </div>
                  </div>
                  {form.coaching_style === value && (
                    <Check size={16} color="var(--accent)" style={{ marginTop: 2 }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4 — Speech Profile */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Your speech profile</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              This affects how your sessions are analyzed.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {([
                { value: 'standard' as SpeechProfile, label: 'Standard', description: 'Analyze all aspects of my speech delivery' },
                { value: 'stutter_aware' as SpeechProfile, label: 'Stutter-Aware', description: 'Focus on structure and content — not fluency' },
              ]).map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => setForm((f) => ({ ...f, speech_profile: value }))}
                  style={{
                    padding: '1rem 1.25rem',
                    background: form.speech_profile === value ? 'var(--accent-muted)' : 'var(--bg-card)',
                    border: `1.5px solid ${form.speech_profile === value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 700,
                          color: form.speech_profile === value ? 'var(--accent)' : 'var(--text-primary)',
                          marginBottom: 4,
                        }}
                      >
                        {label}
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                        {description}
                      </div>
                    </div>
                    {form.speech_profile === value && (
                      <Check size={16} color="var(--accent)" style={{ marginTop: 2 }} />
                    )}
                  </div>
                  {value === 'stutter_aware' && (
                    <p
                      style={{
                        marginTop: 10,
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'DM Sans, sans-serif',
                        lineHeight: 1.5,
                      }}
                    >
                      This mode focuses coaching on what you can control: your structure, word choice, and how you open and close. Fluency is never scored or commented on.
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 — Confirmation */}
        {step === 5 && (
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '1.75rem', marginBottom: 8 }}>Ready to start coaching</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Here&apos;s your coaching profile. Everything can be changed later in Settings.
            </p>
            <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <SummaryRow label="Name" value={form.name} />
              <SummaryRow label="Goal" value={GOALS.find((g) => g.value === form.goal)?.label ?? ''} />
              <SummaryRow
                label="Style"
                value={COACHING_STYLES.find((s) => s.value === form.coaching_style)?.label ?? ''}
              />
              <SummaryRow
                label="Profile"
                value={form.speech_profile === 'stutter_aware' ? 'Stutter-Aware' : 'Standard'}
                last
              />
            </div>
            <button
              className="btn-secondary"
              onClick={() => setStep(1)}
              style={{ width: '100%', marginBottom: 8 }}
            >
              Edit Profile
            </button>
            {error && (
              <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: 8, textAlign: 'center' }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: 12, marginTop: '2rem' }}>
          {step > 1 && (
            <button
              className="btn-secondary"
              onClick={() => setStep((s) => s - 1)}
              style={{ minWidth: 48 }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {step < 5 ? (
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={!canProceed}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={saving}
              onClick={handleFinish}
            >
              {saving ? 'Setting up…' : 'Start Coaching'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  last = false,
}: {
  label: string
  value: string
  last?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: last ? 0 : '0.75rem',
        marginBottom: last ? 0 : '0.75rem',
        borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{value}</span>
    </div>
  )
}
