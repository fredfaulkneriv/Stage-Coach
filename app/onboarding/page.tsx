import { redirect } from 'next/navigation'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import type { User } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const userId = SINGLE_USER_ID

  // If user already has a profile, redirect to dashboard
  const users = await d1Query<User>(
    'SELECT id FROM users WHERE id = ? LIMIT 1',
    [userId]
  ).catch(() => [])

  if (users.length > 0) {
    redirect('/')
  }

  return <OnboardingFlow />
}
