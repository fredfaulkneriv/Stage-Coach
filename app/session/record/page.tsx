'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/app-shell'
import { Recorder } from '@/components/session/recorder'

function RecordContent() {
  const searchParams = useSearchParams()
  const topic = searchParams.get('topic')
  const duration = parseInt(searchParams.get('duration') ?? '120', 10)

  return (
    <AppShell>
      <div style={{ paddingTop: '0.5rem' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Topic
          </p>
          <h1 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', lineHeight: 1.4, maxWidth: 400, margin: '0 auto' }}>
            {topic ?? 'Freestyle — speak on anything'}
          </h1>
        </div>
        <Recorder topic={topic} maxDuration={duration} />
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
