import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { password } = await request.json()
  const appPassword = process.env.APP_PASSWORD
  const sessionSecret = process.env.SESSION_SECRET

  if (!appPassword || !sessionSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (password !== appPassword) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('sc-session', sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
  return response
}
