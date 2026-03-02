'use client'

import { useEffect, useRef } from 'react'
import {
  Star,
  Zap,
  Target,
  Flame,
  Shield,
  Award,
  BookOpen,
  MessageSquare,
} from 'lucide-react'
import type { Badge } from '@/lib/types'

const BADGE_ICONS: Record<string, React.ReactNode> = {
  first_session: <MessageSquare size={22} />,
  filler_slayer: <Target size={22} />,
  speed_tamed: <Zap size={22} />,
  high_scorer: <Star size={22} />,
  iron_mic_7: <Flame size={22} />,
  iron_mic_30: <Shield size={22} />,
  structure_star: <BookOpen size={22} />,
  strong_opener: <Award size={22} />,
}

interface BadgeCardProps {
  badge: Badge
  animate?: boolean
  locked?: boolean
}

export function BadgeCard({ badge, animate = false, locked = false }: BadgeCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (animate && ref.current) {
      ref.current.classList.add('animate-badge-earn')
    }
  }, [animate])

  const icon = BADGE_ICONS[badge.badge_key] ?? <Star size={22} />

  return (
    <div
      ref={ref}
      className="card"
      style={{
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        opacity: locked ? 0.35 : 1,
        filter: locked ? 'grayscale(1)' : 'none',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: locked ? 'var(--bg-surface)' : 'var(--accent-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: locked ? 'var(--text-muted)' : 'var(--accent)',
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '0.875rem',
            color: locked ? 'var(--text-muted)' : 'var(--text-primary)',
          }}
        >
          {badge.badge_name}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
          {locked ? 'Not yet earned' : badge.badge_description}
        </div>
      </div>
      {!locked && (
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {new Date(badge.earned_at).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

interface BadgeMiniProps {
  badge: Badge
}

export function BadgeMini({ badge }: BadgeMiniProps) {
  const icon = BADGE_ICONS[badge.badge_key] ?? <Star size={16} />

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0.5rem 0.75rem',
        background: 'var(--accent-muted)',
        borderRadius: '0.5rem',
        border: '1px solid var(--accent)33',
      }}
    >
      <span style={{ color: 'var(--accent)' }}>{icon}</span>
      <span style={{ fontSize: '0.8rem', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
        {badge.badge_name}
      </span>
    </div>
  )
}
