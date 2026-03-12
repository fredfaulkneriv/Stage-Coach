'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Loader2, ChevronLeft, ChevronRight, Mic, Sparkles, RefreshCw } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type RelationshipType = 'colleague' | 'new_acquaintance' | 'client' | 'stranger'
type Setting = 'work' | 'social' | 'networking' | 'casual'
type Phase = 'setup' | 'alternatives' | 'drill'

interface OpenerCard {
  label: string
  badge: string
  text: string
  badgeColor: string
}

// ─── Weak opener lookup ───────────────────────────────────────────────────────

const WEAK_OPENERS: Record<Setting, Record<RelationshipType, { text: string; reason: string }>> = {
  work: {
    colleague: {
      text: 'How was your weekend?',
      reason:
        'Generic and binary — invites "good" or "fine" and signals you don\'t know them well enough to ask something specific.',
    },
    new_acquaintance: {
      text: 'So, what do you do?',
      reason:
        'Opens with role-first framing — people feel reduced to their job title before they\'ve said a single interesting thing.',
    },
    client: {
      text: "How's business going?",
      reason:
        'Surfaces performance anxiety before rapport exists — people feel evaluated, not welcomed.',
    },
    stranger: {
      text: 'Have you been to these before?',
      reason: 'Closed yes/no question with nowhere to go after the answer.',
    },
  },
  social: {
    colleague: {
      text: 'How was your weekend?',
      reason:
        'The most predictable opener between coworkers — both parties already know how this plays out.',
    },
    new_acquaintance: {
      text: 'Do you know many people here?',
      reason:
        'Highlights the awkwardness of not knowing people rather than bypassing it entirely.',
    },
    client: {
      text: 'So how do you know the host?',
      reason:
        'Assumes social capital that may not exist — can feel like a pop quiz on your network.',
    },
    stranger: {
      text: 'Are you enjoying it so far?',
      reason: 'Predictable yes with nowhere to go — "Yeah, it\'s great" closes the loop.',
    },
  },
  networking: {
    colleague: {
      text: "So, what have you been up to?",
      reason: 'Vague catch-all that produces equally vague answers and no real connection.',
    },
    new_acquaintance: {
      text: 'What do you do?',
      reason:
        'The most overused opener at any professional event — immediately forgettable and reductive.',
    },
    client: {
      text: 'So what brings you out tonight?',
      reason: 'The answer is always "networking" — adds nothing and reveals nothing.',
    },
    stranger: {
      text: 'What do you do?',
      reason:
        'Opens with job title framing before any real connection is made — reductive and overused.',
    },
  },
  casual: {
    colleague: {
      text: "How's it going?",
      reason:
        'The most common opener on earth — immediately forgettable and answered on autopilot.',
    },
    new_acquaintance: {
      text: 'Nice to meet you.',
      reason:
        'A statement, not an opener — closes the loop before the conversation has a chance to start.',
    },
    client: {
      text: "How's everything going?",
      reason: 'Vague and produces a reflexive "fine" — offers no direction or energy.',
    },
    stranger: {
      text: "How's your day going?",
      reason: 'Shallow and expected — answered in the same breath it was asked.',
    },
  },
}

// ─── Selectors data ───────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string; emoji: string }[] = [
  { value: 'colleague', label: 'Colleague', emoji: '🤝' },
  { value: 'new_acquaintance', label: 'New Acquaintance', emoji: '👋' },
  { value: 'client', label: 'Client', emoji: '💼' },
  { value: 'stranger', label: 'Stranger', emoji: '🌐' },
]

const SETTING_OPTIONS: { value: Setting; label: string; emoji: string }[] = [
  { value: 'work', label: 'Work', emoji: '🏢' },
  { value: 'social', label: 'Social', emoji: '🎉' },
  { value: 'networking', label: 'Networking', emoji: '📡' },
  { value: 'casual', label: 'Casual', emoji: '☕' },
]

// ─── Card style helper ────────────────────────────────────────────────────────

function badgeStyle(color: string) {
  return {
    display: 'inline-block',
    fontSize: '0.65rem',
    fontFamily: 'Syne, sans-serif',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    padding: '2px 8px',
    borderRadius: 99,
    background: color + '22',
    color: color,
    marginBottom: 8,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BetterOpenersPage() {
  const router = useRouter()

  // Setup state
  const [relationship, setRelationship] = useState<RelationshipType>('new_acquaintance')
  const [setting, setSetting] = useState<Setting>('networking')
  const [sharedContext, setSharedContext] = useState('')

  // Phase
  const [phase, setPhase] = useState<Phase>('setup')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Results
  const [curatedOpener, setCuratedOpener] = useState('')
  const [aiOpener, setAiOpener] = useState('')
  const [deepener, setDeepener] = useState('')

  // Drill state
  const [drillIndex, setDrillIndex] = useState(0)

  const weakOpener = WEAK_OPENERS[setting][relationship]

  // ── Fetch alternatives ──────────────────────────────────────────────────────

  async function fetchAlternatives() {
    setIsLoading(true)
    setLoadError(null)

    try {
      const [curatedRes, aiRes] = await Promise.all([
        fetch(
          `/api/better-openers/openers?setting=${setting}&relationship_type=${relationship}`
        ).then((r) => r.json()),
        fetch('/api/better-openers/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ relationship_type: relationship, setting, shared_context: sharedContext }),
        }).then((r) => r.json()),
      ])

      if (!curatedRes.success) throw new Error('Failed to load curated opener')
      if (!aiRes.success) throw new Error('Failed to generate AI opener')

      setCuratedOpener(curatedRes.data.curated?.text ?? '')
      setDeepener(curatedRes.data.deepener?.text ?? "What drew you to that in the first place?")
      setAiOpener(aiRes.data.opener ?? '')
      setDrillIndex(0)
      setPhase('alternatives')
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Drill helpers ───────────────────────────────────────────────────────────

  const drillCards: OpenerCard[] = [
    { label: 'Curated', badge: '🎯 From the Library', text: curatedOpener, badgeColor: '#00D4AA' },
    { label: 'AI-Crafted', badge: '✨ Built for Your Context', text: aiOpener, badgeColor: '#8B5CF6' },
    { label: 'Deepener', badge: '💬 When the Conversation Stalls', text: deepener, badgeColor: '#F59E0B' },
  ]

  function handlePractice(text: string) {
    const params = new URLSearchParams()
    params.set('mode', 'freestyle')
    params.set('topic', `Better Opener practice: "${text}"`)
    params.set('duration', '60')
    router.push(`/session/record?${params.toString()}`)
  }

  function handleRefresh() {
    setPhase('setup')
    setCuratedOpener('')
    setAiOpener('')
    setDeepener('')
    setDrillIndex(0)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div style={{ paddingTop: '0.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'var(--accent-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
            }}
          >
            <Sparkles size={26} color="var(--accent)" />
          </div>
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1.5rem',
              color: 'var(--text-primary)',
              margin: '0 0 4px',
            }}
          >
            Better Openers
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Replace weak small talk with specific, curiosity-driven conversation starters.
          </p>
        </div>

        {/* ── PHASE: SETUP ─────────────────────────────────────────────────── */}
        {phase === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Who are you talking to? */}
            <section>
              <h2 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Who are you talking to?
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {RELATIONSHIP_OPTIONS.map(({ value, label, emoji }) => {
                  const isSelected = relationship === value
                  return (
                    <button
                      key={value}
                      onClick={() => setRelationship(value)}
                      style={{
                        padding: '0.75rem',
                        background: isSelected ? 'var(--accent-muted)' : 'var(--bg-card)',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{emoji}</div>
                      <div
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                        }}
                      >
                        {label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Setting */}
            <section>
              <h2 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Setting
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {SETTING_OPTIONS.map(({ value, label, emoji }) => {
                  const isSelected = setting === value
                  return (
                    <button
                      key={value}
                      onClick={() => setSetting(value)}
                      style={{
                        padding: '0.75rem',
                        background: isSelected ? 'var(--accent-muted)' : 'var(--bg-card)',
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border-subtle)'}`,
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{emoji}</div>
                      <div
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                        }}
                      >
                        {label}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Shared context */}
            <section>
              <h2 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Shared context{' '}
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </h2>
              <textarea
                value={sharedContext}
                onChange={(e) => setSharedContext(e.target.value)}
                placeholder='e.g. "just got back from a conference", "Monday morning", "first 1:1"'
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
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
              />
            </section>

            {loadError && (
              <p style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
                {loadError}
              </p>
            )}

            <button
              className="btn-primary"
              onClick={fetchAlternatives}
              disabled={isLoading}
              style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Generating your openers…
                </>
              ) : (
                'Find me a better opener'
              )}
            </button>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ── PHASE: ALTERNATIVES ─────────────────────────────────────────── */}
        {phase === 'alternatives' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Weak opener — what to avoid */}
            <div
              style={{
                background: '#EF444410',
                border: '1px solid #EF444433',
                borderRadius: '0.875rem',
                padding: '1rem',
              }}
            >
              <p
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--error)',
                  marginBottom: 8,
                }}
              >
                ❌ Weak Opener to Replace
              </p>
              <p
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                  lineHeight: 1.4,
                }}
              >
                &ldquo;{weakOpener.text}&rdquo;
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>
                {weakOpener.reason}
              </p>
            </div>

            {/* Curated opener */}
            <AlternativeCard
              badge="🎯 From the Library"
              badgeColor="#00D4AA"
              text={curatedOpener}
              onPractice={() => handlePractice(curatedOpener)}
            />

            {/* AI-generated opener */}
            <AlternativeCard
              badge="✨ Built for Your Context"
              badgeColor="#8B5CF6"
              text={aiOpener}
              onPractice={() => handlePractice(aiOpener)}
            />

            {/* Deepener */}
            <AlternativeCard
              badge="💬 When the Conversation Stalls"
              badgeColor="#F59E0B"
              text={deepener}
              description="Use this as a follow-up when the exchange loses momentum."
              onPractice={() => handlePractice(deepener)}
            />

            {/* Drill CTA */}
            <button
              className="btn-primary"
              onClick={() => { setDrillIndex(0); setPhase('drill') }}
              style={{ width: '100%', fontSize: '1rem', padding: '0.875rem', marginTop: 4 }}
            >
              Drill Mode — Practice These
            </button>

            {/* Refresh */}
            <button
              className="btn-secondary"
              onClick={handleRefresh}
              style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem' }}
            >
              <RefreshCw size={16} />
              Change Context
            </button>
          </div>
        )}

        {/* ── PHASE: DRILL ─────────────────────────────────────────────────── */}
        {phase === 'drill' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Card counter */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Opener {drillIndex + 1} of {drillCards.length}
              </p>
            </div>

            {/* Flashcard */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1rem',
                padding: '1.75rem 1.5rem',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <span style={badgeStyle(drillCards[drillIndex].badgeColor)}>
                  {drillCards[drillIndex].badge}
                </span>
                <p
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.45,
                    margin: 0,
                  }}
                >
                  &ldquo;{drillCards[drillIndex].text}&rdquo;
                </p>
              </div>

              {/* Practice button */}
              <button
                className="btn-primary"
                onClick={() => handlePractice(drillCards[drillIndex].text)}
                style={{ marginTop: '1.5rem', width: '100%', fontSize: '0.9375rem' }}
              >
                <Mic size={17} />
                Record Delivery
              </button>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setDrillIndex((i) => Math.max(0, i - 1))}
                disabled={drillIndex === 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.75rem',
                  color: drillIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: drillIndex === 0 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: '0.875rem',
                  fontFamily: 'DM Sans, sans-serif',
                  opacity: drillIndex === 0 ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <button
                onClick={() => setDrillIndex((i) => Math.min(drillCards.length - 1, i + 1))}
                disabled={drillIndex === drillCards.length - 1}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '0.75rem',
                  color: drillIndex === drillCards.length - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                  cursor: drillIndex === drillCards.length - 1 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: '0.875rem',
                  fontFamily: 'DM Sans, sans-serif',
                  opacity: drillIndex === drillCards.length - 1 ? 0.4 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Dot indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
              {drillCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDrillIndex(i)}
                  style={{
                    width: i === drillIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: i === drillIndex ? 'var(--accent)' : 'var(--bg-card)',
                    border: `1px solid ${i === drillIndex ? 'var(--accent)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Back to alternatives */}
            <button
              className="btn-secondary"
              onClick={() => setPhase('alternatives')}
              style={{ width: '100%', fontSize: '0.875rem', padding: '0.625rem' }}
            >
              Back to Alternatives
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}

// ─── Alternative Card ─────────────────────────────────────────────────────────

function AlternativeCard({
  badge,
  badgeColor,
  text,
  description,
  onPractice,
}: {
  badge: string
  badgeColor: string
  text: string
  description?: string
  onPractice: () => void
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '0.875rem',
        padding: '1rem',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          fontSize: '0.65rem',
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '2px 8px',
          borderRadius: 99,
          background: badgeColor + '22',
          color: badgeColor,
          marginBottom: 10,
        }}
      >
        {badge}
      </span>
      <p
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '1.05rem',
          color: 'var(--text-primary)',
          lineHeight: 1.45,
          marginBottom: description ? 8 : 16,
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
      {description && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
          {description}
        </p>
      )}
      <button
        onClick={onPractice}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: `1px solid ${badgeColor}44`,
          borderRadius: '0.625rem',
          padding: '0.5rem 0.875rem',
          color: badgeColor,
          fontSize: '0.8125rem',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = badgeColor + '15')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
      >
        <Mic size={14} />
        Practice This
      </button>
    </div>
  )
}
