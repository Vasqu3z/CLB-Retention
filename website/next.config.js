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
  },
}

module.exports = withBundleAnalyzer(nextConfig)
