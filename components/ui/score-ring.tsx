'use client'

import { useEffect, useRef } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  label?: string
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#10B981'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

export function ScoreRing({ score, size = 160, strokeWidth = 12, label }: ScoreRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)

  useEffect(() => {
    const circle = circleRef.current
    if (!circle) return
    circle.style.strokeDashoffset = String(circumference)
    const raf = requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 1s ease-out'
      circle.style.strokeDashoffset = String(offset)
    })
    return () => cancelAnimationFrame(raf)
  }, [score, circumference, offset])

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#FFFFFF08"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: size * 0.225,
            color,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        {label && (
          <span
            style={{
              fontSize: size * 0.09,
              color: 'var(--text-muted)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

interface SmallScoreCardProps {
  label: string
  score: number | null
}

export function SmallScoreCard({ label, score }: SmallScoreCardProps) {
  const color =
    score == null ? 'var(--text-muted)' : getScoreColor(score)

  return (
    <div
      className="card"
      style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 90,
      }}
    >
      <span
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: '1.5rem',
          color,
        }}
      >
        {score ?? '—'}
      </span>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {label}
      </span>
    </div>
  )
}
