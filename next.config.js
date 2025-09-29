/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Enable strict type checking
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable strict linting
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['lightarchitects.io', 'api.c0rs0.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' wss: https:",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/license/:path*',
        destination: `${process.env.C0RS0_API_URL}/api/v1/:path*`,
      },
    ];
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_NAME: 'C0RS0 License Portal',
    NEXT_PUBLIC_API_URL: process.env.C0RS0_API_URL || 'http://localhost:8080',
    NEXT_PUBLIC_WS_URL: process.env.C0RS0_WS_URL || 'ws://localhost:8080',
  },
}

module.exports = nextConfig