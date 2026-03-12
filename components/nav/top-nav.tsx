'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Mic, BookOpen, History, User, Mic2, LogOut, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/session/new', icon: Mic, label: 'Record' },
  { href: '/better-openers', icon: Sparkles, label: 'Openers' },
  { href: '/train', icon: BookOpen, label: 'Train' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav
      style={{
        height: 64,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        gap: '2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          marginRight: 'auto',
        }}
      >
        <Mic2 size={20} color="var(--accent)" />
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: 'var(--text-primary)',
          }}
        >
          Stage Coach
        </span>
      </Link>

      {/* Nav links */}
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'color 0.15s',
            }}
          >
            <Icon size={17} />
            {label}
          </Link>
        )
      })}

      <button
        onClick={handleLogout}
        title="Sign out"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--text-muted)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: 0,
          fontFamily: 'inherit',
          transition: 'color 0.15s',
        }}
      >
        <LogOut size={17} />
        Sign out
      </button>

    </nav>
  )
}
