'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Mic, BookOpen, History, User } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/session/new', icon: Mic, label: 'Record' },
  { href: '/train', icon: BookOpen, label: 'Train' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 68,
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              textDecoration: 'none',
              transition: 'color 0.15s',
              minWidth: 44,
              minHeight: 44,
              justifyContent: 'center',
            }}
          >
            <Icon size={22} />
            <span style={{ fontSize: '0.65rem', fontWeight: 500 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
