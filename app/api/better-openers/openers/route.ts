import { NextResponse } from 'next/server'
import { d1Query } from '@/lib/db'

interface Opener {
  id: string
  text: string
  setting: string
  relationship_type: string
  opener_type: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const setting = searchParams.get('setting') ?? 'any'
  const relationshipType = searchParams.get('relationship_type') ?? 'any'

  try {
    // Fetch a curated starter: prefer exact match, fall back to 'any' variants
    const starters = await d1Query<Opener>(
      `SELECT * FROM openers
       WHERE opener_type = 'starter'
         AND (
           (setting = ? AND relationship_type = ?)
           OR (setting = 'any' AND relationship_type = ?)
           OR (setting = ? AND relationship_type = 'any')
           OR (setting = 'any' AND relationship_type = 'any')
         )
       ORDER BY RANDOM()
       LIMIT 1`,
      [setting, relationshipType, relationshipType, setting]
    )

    // Fetch a random deepener
    const deepeners = await d1Query<Opener>(
      `SELECT * FROM openers WHERE opener_type = 'deepener' ORDER BY RANDOM() LIMIT 1`,
      []
    )

    const curated = starters[0] ?? null
    const deepener = deepeners[0] ?? null

    return NextResponse.json({ success: true, data: { curated, deepener } })
  } catch (err) {
    console.error('better-openers/openers error:', err)
    return NextResponse.json({ success: false, error: 'Failed to fetch openers' }, { status: 500 })
  }
}
