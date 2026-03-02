export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0F1B2D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: '#F0F4F8',
        fontFamily: 'DM Sans, sans-serif',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '3rem' }}>404</h1>
      <p style={{ color: '#8896A7' }}>Page not found.</p>
      <a
        href="/"
        style={{
          color: '#00D4AA',
          textDecoration: 'none',
          fontSize: '0.9375rem',
          marginTop: '0.5rem',
        }}
      >
        ← Back to Stage Coach
      </a>
    </div>
  )
}
