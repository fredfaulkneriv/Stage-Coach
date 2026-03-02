import { NextResponse } from 'next/server'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import type { ApiResponse, Session } from '@/lib/types'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const rows = await d1Query<Session>(
      'SELECT * FROM sessions WHERE id = ? AND user_id = ? LIMIT 1',
      [id, SINGLE_USER_ID]
    )

    if (rows.length === 0) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Session not found.' }, { status: 404 })
    }

    const session = rows[0]
    const parsed: Session = {
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

    return NextResponse.json<ApiResponse<Session>>({ success: true, data: parsed })
  } catch (err) {
    console.error('GET /api/sessions/[id] error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load session.' },
      { status: 500 }
    )
  }
}
