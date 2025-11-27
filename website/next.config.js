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
    // Allow external image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/Vasqu3z/Comets-League-Baseball/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
        pathname: '/**',
      },
      // Add other domains as needed (Google Drive, imgur, etc.)
    ],
  },
}

module.exports = withBundleAnalyzer(nextConfig)
