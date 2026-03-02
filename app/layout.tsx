import './globals.css'
import { ServiceWorkerRegistrar } from '@/components/service-worker-registrar'

// Never statically prerender — dynamic data on every request.
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Stage Coach – AI Speech Coach',
  description: 'Personal AI speech and presentation coaching app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Stage Coach',
    statusBarStyle: 'black-translucent' as const,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#00D4AA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  )
}
