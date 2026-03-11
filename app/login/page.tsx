'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mic2, Lock } from 'lucide-react'

function LoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      const from = searchParams.get('from') || '/'
      router.push(from)
      router.refresh()
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mic2 size={24} color="var(--accent)" />
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1.4rem',
              color: 'var(--text-primary)',
            }}
          >
            Stage Coach
          </span>
        </div>

        {/* Lock icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'var(--accent-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Lock size={24} color="var(--accent)" />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '1.25rem',
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
            Enter your password to continue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'var(--bg-card)',
              border: error ? '1px solid var(--error)' : '1px solid var(--border-subtle)',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'DM Sans, sans-serif',
              outline: 'none',
            }}
          />

          {error && (
            <p style={{ color: 'var(--error)', fontSize: '0.875rem', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading || !password ? 'var(--bg-card)' : 'var(--accent)',
              color: loading || !password ? 'var(--text-muted)' : '#0F1B2D',
              border: 'none',
              borderRadius: 10,
              fontSize: '1rem',
              fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
