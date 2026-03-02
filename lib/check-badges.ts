import { d1Query, d1Execute } from './db'
import type { Badge, CoachingFeedbackItem, Session, SpeechProfile } from './types'
import { v4 as uuidv4 } from 'uuid'

interface BadgeDefinition {
  key: string
  name: string
  description: string
  profileRestricted?: 'standard_only'
}

export const ALL_BADGES: BadgeDefinition[] = [
  {
    key: 'first_session',
    name: 'First Words',
    description: 'Completed your first coaching session.',
  },
  {
    key: 'filler_slayer',
    name: 'Filler Slayer',
    description: 'Delivered a 2+ minute session with zero filler words.',
    profileRestricted: 'standard_only',
  },
  {
    key: 'speed_tamed',
    name: 'Speed Demon Tamed',
    description: 'Achieved ideal WPM (120–160) in 3 consecutive sessions.',
    profileRestricted: 'standard_only',
  },
  {
    key: 'high_scorer',
    name: 'Sharp',
    description: 'Scored 85 or higher overall in a session.',
  },
  {
    key: 'iron_mic_7',
    name: 'Iron Mic',
    description: 'Maintained a 7-day practice streak.',
  },
  {
    key: 'iron_mic_30',
    name: 'Iron Mic Pro',
    description: 'Maintained a 30-day practice streak.',
  },
  {
    key: 'structure_star',
    name: 'Structure Star',
    description: 'Achieved a structure score of 90 or higher.',
  },
  {
    key: 'strong_opener',
    name: 'Strong Opener',
    description: 'Received feedback praising your opening in 3 separate sessions.',
  },
]

interface BadgeCheckContext {
  userId: string
  sessionId: string
  session: Pick<
    Session,
    | 'duration_seconds'
    | 'filler_word_count'
    | 'overall_score'
    | 'structure_score'
    | 'wpm'
    | 'coaching_feedback'
  >
  currentStreak: number
  speechProfile: SpeechProfile
}

async function hasEarnedBadge(userId: string, badgeKey: string): Promise<boolean> {
  const rows = await d1Query<{ id: string }>(
    'SELECT id FROM badges WHERE user_id = ? AND badge_key = ? LIMIT 1',
    [userId, badgeKey]
  )
  return rows.length > 0
}

async function insertBadge(
  userId: string,
  sessionId: string,
  def: BadgeDefinition
): Promise<Badge> {
  const id = uuidv4()
  const now = new Date().toISOString()
  await d1Execute(
    `INSERT INTO badges (id, user_id, badge_key, badge_name, badge_description, earned_at, session_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, def.key, def.name, def.description, now, sessionId]
  )
  return {
    id,
    user_id: userId,
    badge_key: def.key,
    badge_name: def.name,
    badge_description: def.description,
    earned_at: now,
    session_id: sessionId,
  }
}

function feedbackMentionsOpening(feedback: CoachingFeedbackItem[]): boolean {
  return feedback.some(
    (f) =>
      f.type === 'strength' &&
      /open(ing|er)|hook|start|introduc|begin/i.test(f.message)
  )
}

export async function checkAndAwardBadges(ctx: BadgeCheckContext): Promise<Badge[]> {
  const { userId, sessionId, session, currentStreak, speechProfile } = ctx
  const awarded: Badge[] = []

  // Helper
  async function tryAward(def: BadgeDefinition): Promise<void> {
    if (def.profileRestricted === 'standard_only' && speechProfile !== 'standard') return
    if (await hasEarnedBadge(userId, def.key)) return
    const badge = await insertBadge(userId, sessionId, def)
    awarded.push(badge)
  }

  // first_session — always
  await tryAward(ALL_BADGES.find((b) => b.key === 'first_session')!)

  // filler_slayer — standard only, 0 fillers, 2+ min
  if (
    speechProfile === 'standard' &&
    session.filler_word_count === 0 &&
    session.duration_seconds >= 120
  ) {
    await tryAward(ALL_BADGES.find((b) => b.key === 'filler_slayer')!)
  }

  // speed_tamed — standard only, check last 3 sessions
  if (speechProfile === 'standard' && session.wpm != null && session.wpm >= 120 && session.wpm <= 160) {
    const recentSessions = await d1Query<{ wpm: number }>(
      `SELECT wpm FROM sessions
       WHERE user_id = ? AND wpm IS NOT NULL
       ORDER BY created_at DESC
       LIMIT 3`,
      [userId]
    )
    if (
      recentSessions.length === 3 &&
      recentSessions.every((s) => s.wpm >= 120 && s.wpm <= 160)
    ) {
      await tryAward(ALL_BADGES.find((b) => b.key === 'speed_tamed')!)
    }
  }

  // high_scorer — overall_score >= 85
  if (session.overall_score != null && session.overall_score >= 85) {
    await tryAward(ALL_BADGES.find((b) => b.key === 'high_scorer')!)
  }

  // iron_mic_7 — 7-day streak
  if (currentStreak >= 7) {
    await tryAward(ALL_BADGES.find((b) => b.key === 'iron_mic_7')!)
  }

  // iron_mic_30 — 30-day streak
  if (currentStreak >= 30) {
    await tryAward(ALL_BADGES.find((b) => b.key === 'iron_mic_30')!)
  }

  // structure_star — structure_score >= 90
  if (session.structure_score != null && session.structure_score >= 90) {
    await tryAward(ALL_BADGES.find((b) => b.key === 'structure_star')!)
  }

  // strong_opener — strength feedback mentioning opening in 3 sessions
  if (session.coaching_feedback && feedbackMentionsOpening(session.coaching_feedback)) {
    const openerSessions = await d1Query<{ id: string }>(
      `SELECT id FROM sessions
       WHERE user_id = ?
         AND coaching_feedback LIKE '%strength%'
         AND (
           coaching_feedback LIKE '%open%'
           OR coaching_feedback LIKE '%hook%'
           OR coaching_feedback LIKE '%start%'
         )
       LIMIT 3`,
      [userId]
    )
    if (openerSessions.length >= 3) {
      await tryAward(ALL_BADGES.find((b) => b.key === 'strong_opener')!)
    }
  }

  return awarded
}
