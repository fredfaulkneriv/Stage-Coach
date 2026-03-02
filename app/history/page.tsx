import { redirect } from 'next/navigation'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'
import { HistoryView } from '@/components/history/history-view'
import type { Session, User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const userId = SINGLE_USER_ID

  const [users, sessionRows] = await Promise.all([
    d1Query<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]).catch(() => [] as User[]),
    d1Query<Session>(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    ).catch(() => [] as Session[]),
  ])

  if (users.length === 0) redirect('/onboarding')

  const sessions = sessionRows.map((s) => ({
    ...s,
    coaching_feedback:
      typeof s.coaching_feedback === 'string'
        ? JSON.parse(s.coaching_feedback as unknown as string)
        : s.coaching_feedback,
  }))

  return (
    <AppShell>
      <HistoryView sessions={sessions} speechProfile={users[0].speech_profile} />
    </AppShell>
  )
}
