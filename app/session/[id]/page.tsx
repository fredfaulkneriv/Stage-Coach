import { notFound } from 'next/navigation'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { AppShell } from '@/components/app-shell'
import { ScorecardView } from '@/components/session/scorecard'
import type { Badge, Session, User } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}

export default async function ScorecardPage({ params, searchParams }: Props) {
  const userId = SINGLE_USER_ID

  const { id } = await params
  const { new: isNew } = await searchParams

  const [sessionRows, userRows, badgeRows] = await Promise.all([
    d1Query<Session>('SELECT * FROM sessions WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]),
    d1Query<User>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]),
    d1Query<Badge>('SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC LIMIT 3', [userId]),
  ])

  if (sessionRows.length === 0) notFound()

  const session = sessionRows[0]
  const user = userRows[0]

  // Parse JSON fields
  const parsedSession: Session = {
    ...session,
    filler_words_found:
      typeof session.filler_words_found === 'string'
        ? JSON.parse(session.filler_words_found as unknown as string)
        : session.filler_words_found,
    coaching_feedback:
      typeof session.coaching_feedback === 'string'
        ? JSON.parse(session.coaching_feedback as unknown as string)
        : session.coaching_feedback,
  }

  return (
    <AppShell>
      <ScorecardView
        session={parsedSession}
        user={user}
        recentBadges={badgeRows}
        isNew={isNew === '1'}
      />
    </AppShell>
  )
}
