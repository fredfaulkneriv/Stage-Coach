import { NextResponse } from 'next/server'
import { d1Query } from '@/lib/db'
import { SINGLE_USER_ID } from '@/lib/auth'
import type { ApiResponse, Badge } from '@/lib/types'

export async function GET() {
  try {
    const badges = await d1Query<Badge>(
      'SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC',
      [SINGLE_USER_ID]
    )

    return NextResponse.json<ApiResponse<Badge[]>>({ success: true, data: badges })
  } catch (err) {
    console.error('GET /api/badges error:', err)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to load badges.' },
      { status: 500 }
    )
  }
}
