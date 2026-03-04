import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Mic } from 'lucide-react'
import { getExerciseById, TIER_INFO } from '@/lib/articulation-exercises'
import { AppShell } from '@/components/app-shell'
import { TextExercise } from '@/components/training/text-exercise'

export default async function ExercisePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams
  if (!id) return notFound()

  const exercise = getExerciseById(id)
  if (!exercise) return notFound()

  const tierInfo = TIER_INFO[exercise.tier]

  // Speak Sharp exercises redirect to the session/new page with articulation mode
  if (exercise.type === 'speak_sharp') {
    return (
      <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Back link */}
        <Link
          href={`/train/${exercise.tier}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 500,
          }}
        >
          <ChevronLeft size={16} />
          Tier {exercise.tier}: {tierInfo.name}
        </Link>

        {/* Header */}
        <div>
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1.3rem',
              color: 'var(--text-primary)',
              margin: '0 0 4px 0',
            }}
          >
            {exercise.title}
          </h1>
        </div>

        {/* Instruction */}
        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {exercise.instruction}
        </p>

        {/* Scenario card */}
        <div
          className="card"
          style={{
            padding: '1.25rem',
            borderLeft: '3px solid var(--accent)',
          }}
        >
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {exercise.prompt}
          </p>
        </div>

        {exercise.timeLimit && (
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              margin: 0,
              textAlign: 'center',
            }}
          >
            Time limit: {exercise.timeLimit} seconds
          </p>
        )}

        {/* Record button */}
        <Link
          href={`/session/new?mode=articulation&topic=${encodeURIComponent(exercise.title)}&duration=${exercise.timeLimit || 60}`}
          style={{ textDecoration: 'none' }}
        >
          <button
            className="btn-primary"
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: '0.75rem',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
          >
            <Mic size={18} />
            Record Response
          </button>
        </Link>
      </div>
      </AppShell>
    )
  }

  // Text-based exercise
  return (
    <AppShell>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Back link */}
      <Link
        href={`/train/${exercise.tier}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 500,
        }}
      >
        <ChevronLeft size={16} />
        Tier {exercise.tier}: {tierInfo.name}
      </Link>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '1.3rem',
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        {exercise.title}
      </h1>

      {/* Exercise component */}
      <TextExercise exercise={exercise} />
    </div>
    </AppShell>
  )
}
