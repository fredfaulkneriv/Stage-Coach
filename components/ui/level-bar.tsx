'use client'

import { getCurrentLevelThreshold, getLevelFromXP, getNextLevelThreshold } from '@/lib/xp'

interface LevelBarProps {
  xp: number
}

export function LevelBar({ xp }: LevelBarProps) {
  const level = getLevelFromXP(xp)
  const current = getCurrentLevelThreshold(xp)
  const next = getNextLevelThreshold(xp)
  const isMax = level === 'Master'
  const progress = isMax ? 100 : Math.round(((xp - current) / (next - current)) * 100)

  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            color: 'var(--accent)',
            fontSize: '0.875rem',
          }}
        >
          {level}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          {isMax ? `${xp} XP (Max)` : `${xp} / ${next} XP`}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: 'var(--bg-surface)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--accent)',
            borderRadius: 4,
            transition: 'width 0.8s ease',
          }}
        />
      </div>
    </div>
  )
}
