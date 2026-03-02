import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // All pages that use auth() are dynamically rendered by default.
  // Increase the body size limit for audio uploads.
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
}

export default nextConfig
