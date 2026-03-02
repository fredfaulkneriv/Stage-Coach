import { NextResponse } from 'next/server'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import type { ApiResponse, Session } from '@/lib/types'

export async function GET() {
  try {
    const rows = await d1Query<Session>(
      `SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [SINGLE_USER_ID]
    )

    // Parse JSON fields
    const sessions = rows.map(parseSessionRow)

    return NextResponse.json<ApiResponse<Session[]>>({ success: true, data: sessions })
  } catch (err) {
    console.error('GET /api/sessions error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load sessions.' },
      { status: 500 }
    )
  }
}

function parseSessionRow(row: Session): Session {
  return {
    ...row,
    filler_words_found:
      typeof row.filler_words_found === 'string'
        ? JSON.parse(row.filler_words_found as unknown as string)
        : row.filler_words_found,
    coaching_feedback:
      typeof row.coaching_feedback === 'string'
        ? JSON.parse(row.coaching_feedback as unknown as string)
        : row.coaching_feedback,
  }
}
