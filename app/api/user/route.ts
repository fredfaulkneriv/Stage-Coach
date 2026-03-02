import { NextResponse } from 'next/server'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import type { ApiResponse, User } from '@/lib/types'

export async function GET() {
  try {
    const rows = await d1Query<User>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [SINGLE_USER_ID]
    )

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse<null>>({ success: true, data: null })
    }

    return NextResponse.json<ApiResponse<User>>({ success: true, data: rows[0] })
  } catch (err) {
    console.error('GET /api/user error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load user profile.' },
      { status: 500 }
    )
  }
}

// Called after onboarding to create the user record
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, goal, coaching_style, speech_profile } = body

    if (!name || !goal || !coaching_style || !speech_profile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Upsert — in case of retry
    await d1Query(
      `INSERT INTO users (id, email, name, goal, coaching_style, speech_profile, level, xp, current_streak, longest_streak, last_session_date, created_at)
       VALUES (?, '', ?, ?, ?, ?, 'Novice', 0, 0, 0, NULL, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         goal = excluded.goal,
         coaching_style = excluded.coaching_style,
         speech_profile = excluded.speech_profile`,
      [SINGLE_USER_ID, name, goal, coaching_style, speech_profile, now]
    )

    const rows = await d1Query<User>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [SINGLE_USER_ID]
    )

    return NextResponse.json<ApiResponse<User>>({ success: true, data: rows[0] })
  } catch (err) {
    console.error('POST /api/user error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create user profile.' },
      { status: 500 }
    )
  }
}
