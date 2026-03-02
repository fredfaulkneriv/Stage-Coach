'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Recorder } from '@/components/session/recorder'
import type { GuidedDrill, GuidedDrillType, PresentationAudience } from '@/lib/types'

const GUIDED_DRILLS: Record<GuidedDrillType, GuidedDrill> = {
  hook: {
    type: 'hook',
    name: 'The Hook',
    description: 'Master your opening — grab attention in 30 seconds',
    recommendedDuration: 120,
    steps: [
      { label: 'Grabber', hint: 'Open with a stat, bold question, or 1-sentence story' },
      { label: 'Problem', hint: 'State the tension or problem clearly' },
      { label: 'Relevance', hint: 'Bridge to why this matters to your audience' },
      { label: 'Preview', hint: "Tell them what you're about to cover" },
    ],
  },
  three_point: {
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
  star_story: {
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
  strong_close: {
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
  prep_response: {
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
}

function RecordContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic')
  const duration = parseInt(searchParams.get('duration') ?? '120', 10)
  const mode = searchParams.get('mode') ?? 'freestyle'
  const drillKey = searchParams.get('drill') as GuidedDrillType | null
  const guidedDrill = mode === 'guided' && drillKey ? GUIDED_DRILLS[drillKey] ?? null : null
  const audienceKey = searchParams.get('audience') as PresentationAudience | null
  const presentationAudience = mode === 'presentation_sim' ? audienceKey : null

  return (
    <AppShell>
      <div style={{ paddingTop: '0.5rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {mode === 'guided' && guidedDrill ? (
            <>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Guided Drill
              </p>
              <h1 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {guidedDrill.name}
              </h1>
              {topic && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: 4 }}>
                  {topic}
                </p>
              )}
            </>
          ) : mode === 'presentation_sim' ? (
            <>
              <p style={{ fontSize: '0.75rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                Presentation Sim
              </p>
              <h1 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {topic ?? 'Full Run-Through'}
              </h1>
            </>
          ) : (
            <>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Topic
              </p>
              <h1 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.4, maxWidth: 400, margin: '0 auto' }}>
                {topic ?? 'Freestyle — speak on anything'}
              </h1>
            </>
          )}
        </div>
        <Recorder topic={topic} maxDuration={duration} mode={mode} guidedDrill={guidedDrill} presentationAudience={presentationAudience} />
      </div>
    </AppShell>
  )
}

export default function RecordPage() {
  return (
    <Suspense fallback={<div />}>
      <RecordContent />
    </Suspense>
  )
}
