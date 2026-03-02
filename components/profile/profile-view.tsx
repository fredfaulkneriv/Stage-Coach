'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, Trophy, Zap, Edit3, Check, X } from 'lucide-react'
import { BadgeCard } from '@/components/ui/badge-card'
import { LevelBar } from '@/components/ui/level-bar'
import type { Badge, CoachingStyle, Goal, SpeechProfile, User } from '@/lib/types'

interface ProfileViewProps {
  user: User
  badges: Badge[]
  earnedKeys: string[]
  totalSessions: number
}

const GOAL_LABELS: Record<Goal, string> = {
  conference_speaking: 'Conference & keynote speaking',
  job_interviews: 'Job interviews & pitching',
  classroom: 'Classroom & academic',
  podcast_hosting: 'Podcast & media',
  sales_pitches: 'Sales & client presentations',
}

const STYLE_LABELS: Record<CoachingStyle, string> = {
  tough_love: 'Tough Love',
  encouraging: 'Encouraging',
  data_driven: 'Data-Driven',
  socratic: 'Socratic',
}

interface EditForm {
  name: string
  goal: Goal
  coaching_style: CoachingStyle
  speech_profile: SpeechProfile
}

export function ProfileView({ user, badges, earnedKeys, totalSessions }: ProfileViewProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm>({
    name: user.name,
    goal: user.goal,
    coaching_style: user.coaching_style,
    speech_profile: user.speech_profile,
  })

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setEditing(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ paddingTop: '0.75rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.5rem' }}>Profile</h1>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        <StatCard icon={<Trophy size={18} color="var(--accent)" />} value={String(totalSessions)} label="Sessions" />
        <StatCard icon={<Zap size={18} color="var(--warning)" />} value={String(user.xp)} label="Total XP" />
        <StatCard icon={<Flame size={18} color="var(--warning)" />} value={String(user.current_streak)} label="Streak" />
      </div>

      {/* Level bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <LevelBar xp={user.xp} />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 8,
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>Longest streak: {user.longest_streak} days</span>
          <span>Current: {user.current_streak} days</span>
        </div>
      </div>

      {/* Profile details */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <h2 style={{ fontSize: '1rem' }}>Coaching Profile</h2>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.8rem',
                padding: '4px 8px',
                borderRadius: 6,
              }}
            >
              <Edit3 size={14} />
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => {
                  setEditing(false)
                  setForm({
                    name: user.name,
                    goal: user.goal,
                    coaching_style: user.coaching_style,
                    speech_profile: user.speech_profile,
                  })
                }}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <X size={13} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: 'var(--accent)',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  color: '#0F1B2D',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Check size={13} />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: 8 }}>{error}</p>
        )}

        {!editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ProfileRow label="Name" value={user.name} />
            <ProfileRow label="Goal" value={GOAL_LABELS[user.goal]} />
            <ProfileRow label="Coaching Style" value={STYLE_LABELS[user.coaching_style]} />
            <ProfileRow
              label="Speech Profile"
              value={user.speech_profile === 'stutter_aware' ? 'Stutter-Aware' : 'Standard'}
              last
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <EditRow label="Name">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputStyle}
              />
            </EditRow>
            <EditRow label="Goal">
              <select
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value as Goal }))}
                style={inputStyle}
              >
                {Object.entries(GOAL_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </EditRow>
            <EditRow label="Style">
              <select
                value={form.coaching_style}
                onChange={(e) =>
                  setForm((f) => ({ ...f, coaching_style: e.target.value as CoachingStyle }))
                }
                style={inputStyle}
              >
                {Object.entries(STYLE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </EditRow>
            <EditRow label="Profile">
              <select
                value={form.speech_profile}
                onChange={(e) =>
                  setForm((f) => ({ ...f, speech_profile: e.target.value as SpeechProfile }))
                }
                style={inputStyle}
              >
                <option value="standard">Standard</option>
                <option value="stutter_aware">Stutter-Aware</option>
              </select>
            </EditRow>
          </div>
        )}
      </div>

      {/* Badges */}
      <h2 style={{ fontSize: '1rem', marginBottom: 12 }}>Badges</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 10,
          marginBottom: '2rem',
        }}
      >
        {badges.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            locked={!earnedKeys.includes(badge.badge_key)}
          />
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  background: 'var(--bg-surface)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '0.5rem',
  color: 'var(--text-primary)',
  fontSize: '0.875rem',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
}

function ProfileRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: last ? 0 : '0.625rem',
        marginBottom: last ? 0 : '0.625rem',
        borderBottom: last ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.8125rem', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  )
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div
      className="card"
      style={{
        flex: 1,
        padding: '0.875rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        textAlign: 'center',
      }}
    >
      {icon}
      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.25rem' }}>
        {value}
      </span>
      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}
