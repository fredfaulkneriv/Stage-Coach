import { redirect } from 'next/navigation'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/dashboard/dashboard'
import type { Badge, Session, User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const userId = SINGLE_USER_ID

  const users = await d1Query<User>(
    'SELECT * FROM users WHERE id = ? LIMIT 1',
    [userId]
  ).catch(() => [] as User[])

  if (users.length === 0) {
    redirect('/onboarding')
  }

  const user = users[0]

  const [sessionRows, badgeRows] = await Promise.all([
    d1Query<Session>(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    ).catch(() => [] as Session[]),
    d1Query<Badge>(
      'SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC LIMIT 3',
      [userId]
    ).catch(() => [] as Badge[]),
  ])

  const lastSession =
    sessionRows.length > 0
      ? {
          ...sessionRows[0],
          coaching_feedback:
            typeof sessionRows[0].coaching_feedback === 'string'
              ? JSON.parse(sessionRows[0].coaching_feedback as unknown as string)
              : sessionRows[0].coaching_feedback,
        }
      : null

  return (
    <AppShell>
      <Dashboard user={user} lastSession={lastSession} recentBadges={badgeRows} />
    </AppShell>
  )
}
