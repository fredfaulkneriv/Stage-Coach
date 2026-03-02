import { redirect } from 'next/navigation'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'
import { ProfileView } from '@/components/profile/profile-view'
import type { Badge, User } from '@/lib/types'
import { ALL_BADGES } from '@/lib/check-badges'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const userId = SINGLE_USER_ID

  const [users, badgeRows, sessionCount] = await Promise.all([
    d1Query<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]).catch(
      () => [] as User[]
    ),
    d1Query<Badge>(
      'SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC',
      [userId]
    ).catch(() => [] as Badge[]),
    d1Query<{ count: number }>(
      'SELECT COUNT(*) as count FROM sessions WHERE user_id = ?',
      [userId]
    ).catch(() => [{ count: 0 }]),
  ])

  if (users.length === 0) redirect('/onboarding')

  const user = users[0]
  const totalSessions = sessionCount[0]?.count ?? 0

  // Build full badge list — earned + available (hide profile-restricted if not applicable)
  const earnedKeys = new Set(badgeRows.map((b) => b.badge_key))
  const availableBadges = ALL_BADGES.filter((def) => {
    if (def.profileRestricted === 'standard_only' && user.speech_profile !== 'standard') {
      return false
    }
    return true
  }).map((def) => {
    const earned = badgeRows.find((b) => b.badge_key === def.key)
    if (earned) return earned
    // Return an unearned placeholder
    return {
      id: def.key,
      user_id: userId,
      badge_key: def.key,
      badge_name: def.name,
      badge_description: def.description,
      earned_at: '',
      session_id: null,
    } satisfies Badge
  })

  return (
    <AppShell>
      <ProfileView
        user={user}
        badges={availableBadges}
        earnedKeys={[...earnedKeys]}
        totalSessions={totalSessions}
      />
    </AppShell>
  )
}
