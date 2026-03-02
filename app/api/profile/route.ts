import { NextResponse } from 'next/server'
import { d1Query, d1Execute } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import type { ApiResponse, User } from '@/lib/types'

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { name, goal, coaching_style, speech_profile } = body

    if (!name || !goal || !coaching_style || !speech_profile) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    await d1Execute(
      `UPDATE users SET name = ?, goal = ?, coaching_style = ?, speech_profile = ?
       WHERE id = ?`,
      [name, goal, coaching_style, speech_profile, SINGLE_USER_ID]
    )

    const rows = await d1Query<User>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [SINGLE_USER_ID]
    )

    return NextResponse.json<ApiResponse<User>>({ success: true, data: rows[0] })
  } catch (err) {
    console.error('PUT /api/profile error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update profile.' },
      { status: 500 }
    )
  }
}
