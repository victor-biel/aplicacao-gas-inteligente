/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : 'https://*.supabase.co'
    const realtimeOrigin = supabaseUrl ? `wss://${new URL(supabaseUrl).host}` : 'wss://*.supabase.co'

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ${supabaseOrigin} ${realtimeOrigin} https://va.vercel-scripts.com https://vitals.vercel-insights.com;`,
          },
        ],
      },
    ]
  },
}

export default nextConfig
