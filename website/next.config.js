/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Server Components
  experimental: {
    // Add experimental features here if needed
  },
};

const withBundleAnalyzer = (() => {
  try {
    const analyzer = require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true',
      openAnalyzer: false,
    });
    return analyzer;
  } catch (error) {
    if (process.env.ANALYZE === 'true') {
      console.warn(
        'Bundle analysis requested but @next/bundle-analyzer is not installed. Run `npm install --save-dev @next/bundle-analyzer` to enable reports.'
      );
    }
    return (config) => config;
  }
})();

module.exports = withBundleAnalyzer(nextConfig);
