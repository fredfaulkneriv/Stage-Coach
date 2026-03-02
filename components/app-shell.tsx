'use client'

import { BottomNav } from './nav/bottom-nav'
import { TopNav } from './nav/top-nav'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <>
      {/* Desktop top nav */}
      <div className="hidden md:block">
        <TopNav />
      </div>

      {/* Page content */}
      <main
        style={{
          minHeight: '100vh',
          paddingBottom: 80, // Reserve space for mobile bottom nav
          paddingTop: 0,
          maxWidth: 720,
          margin: '0 auto',
          padding: '1rem 1rem 80px',
        }}
        className="md:pt-8 md:pb-8"
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="block md:hidden">
        <BottomNav />
      </div>
    </>
  )
}
