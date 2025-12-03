const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Server Components
  experimental: {
    // Add experimental features here if needed
  },
  images: {
    // Optimize image loading
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/Vasqu3z/Comets-League-Baseball/**',
      },
    ],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
