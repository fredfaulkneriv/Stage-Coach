import type { Level, SpeechProfile } from './types'

export function calculateXP(params: {
  duration_seconds: number
  overall_score: number | null
  current_streak: number
  speech_profile: SpeechProfile
  clarity_score: number | null
  structure_score: number | null
}): number {
  const { duration_seconds, overall_score, current_streak, speech_profile, clarity_score, structure_score } = params

  const base_xp = Math.floor(duration_seconds / 60) * 10

  let effective_score: number | null = overall_score
  if (speech_profile === 'stutter_aware' && clarity_score != null && structure_score != null) {
    effective_score = Math.round((clarity_score + structure_score) / 2)
  }

  const score_bonus = effective_score != null && effective_score >= 70 ? 20 : 0
  const streak_bonus = current_streak >= 3 ? 15 : 0

  return base_xp + score_bonus + streak_bonus
}

export function getLevelFromXP(xp: number): Level {
  if (xp >= 2000) return 'Master'
  if (xp >= 1100) return 'Orator'
  if (xp >= 600) return 'Speaker'
  if (xp >= 300) return 'Presenter'
  if (xp >= 100) return 'Communicator'
  return 'Novice'
}

export function getNextLevelThreshold(xp: number): number {
  if (xp >= 2000) return 2000 // Already at max
  if (xp >= 1100) return 2000
  if (xp >= 600) return 1100
  if (xp >= 300) return 600
  if (xp >= 100) return 300
  return 100
}

export function getCurrentLevelThreshold(xp: number): number {
  if (xp >= 2000) return 2000
  if (xp >= 1100) return 1100
  if (xp >= 600) return 600
  if (xp >= 300) return 300
  if (xp >= 100) return 100
  return 0
}

export function updateStreakData(
  lastSessionDate: string | null,
  currentStreak: number,
  longestStreak: number
): { current_streak: number; longest_streak: number; last_session_date: string } {
  const today = new Date().toISOString().split('T')[0]

  if (!lastSessionDate) {
    return {
      current_streak: 1,
      longest_streak: Math.max(longestStreak, 1),
      last_session_date: today,
    }
  }

  if (lastSessionDate === today) {
    // Same day — no streak change
    return {
      current_streak: currentStreak,
      longest_streak: longestStreak,
      last_session_date: today,
    }
  }

  const last = new Date(lastSessionDate)
  const todayDate = new Date(today)
  const diffDays = Math.round((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))

  let newStreak: number
  if (diffDays === 1) {
    newStreak = currentStreak + 1
  } else {
    newStreak = 1
  }

  return {
    current_streak: newStreak,
    longest_streak: Math.max(longestStreak, newStreak),
    last_session_date: today,
  }
}
