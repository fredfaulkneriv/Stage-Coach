'use client'

import { useState } from 'react'
import { Loader2, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import type { ArticulationExercise, ArticulationFeedback, Badge } from '@/lib/types'
import { EXERCISE_TYPE_INFO } from '@/lib/articulation-exercises'
import { ExerciseFeedback } from './exercise-feedback'

interface TextExerciseProps {
  exercise: ArticulationExercise
}

interface EvaluationResult {
  feedback: ArticulationFeedback
  xp_earned: number
  new_level: string | null
  new_badges: Badge[]
  tier_just_completed: boolean
}

export function TextExercise({ exercise }: TextExerciseProps) {
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHints, setShowHints] = useState(false)
  const typeInfo = EXERCISE_TYPE_INFO[exercise.type]

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length
  const isOverLimit = exercise.wordLimit ? wordCount > exercise.wordLimit : false

  async function handleSubmit() {
    if (!response.trim() || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/articulation/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exercise.id,
          user_response: response,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Evaluation failed')
        return
      }
      setResult(json.data)
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <ExerciseFeedback
        feedback={result.feedback}
        xpEarned={result.xp_earned}
        newLevel={result.new_level}
        newBadges={result.new_badges}
        tierJustCompleted={result.tier_just_completed}
        exerciseTier={exercise.tier}
        userResponse={response}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Exercise type badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '1.1rem' }}>{typeInfo.emoji}</span>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--accent)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {typeInfo.name}
        </span>
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

      {/* Prompt card */}
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
            whiteSpace: 'pre-wrap',
          }}
        >
          {exercise.prompt}
        </p>
      </div>

      {/* Word limit indicator */}
      {exercise.wordLimit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: isOverLimit ? '#EF4444' : 'var(--text-muted)',
            }}
          >
            Word limit: {exercise.wordLimit} words
          </span>
        </div>
      )}

      {/* Response textarea */}
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Type your response here..."
        rows={5}
        style={{
          width: '100%',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          fontFamily: 'DM Sans, sans-serif',
          resize: 'vertical',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />

      {/* Word count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.8rem',
            color: isOverLimit ? '#EF4444' : 'var(--text-muted)',
          }}
        >
          {wordCount} word{wordCount !== 1 ? 's' : ''}
          {exercise.wordLimit ? ` / ${exercise.wordLimit} limit` : ''}
        </span>

        {/* Hints toggle */}
        {exercise.hints && exercise.hints.length > 0 && (
          <button
            onClick={() => setShowHints(!showHints)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              padding: 0,
            }}
          >
            <Lightbulb size={14} />
            {showHints ? 'Hide hints' : 'Show hints'}
            {showHints ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Hints */}
      {showHints && exercise.hints && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: '#F59E0B10',
            border: '1px solid #F59E0B30',
          }}
        >
          {exercise.hints.map((hint, i) => (
            <p
              key={i}
              style={{
                fontSize: '0.85rem',
                color: '#F59E0B',
                margin: i === 0 ? 0 : '6px 0 0 0',
                lineHeight: 1.5,
              }}
            >
              {hint}
            </p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <p style={{ fontSize: '0.85rem', color: '#EF4444', margin: 0 }}>{error}</p>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!response.trim() || submitting}
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
          cursor: !response.trim() || submitting ? 'not-allowed' : 'pointer',
          opacity: !response.trim() || submitting ? 0.5 : 1,
        }}
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Evaluating...
          </>
        ) : (
          'Submit'
        )}
      </button>
    </div>
  )
}
