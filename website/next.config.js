/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
};

let withBundleAnalyzer = (config) => config;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const analyzer = require('@next/bundle-analyzer');
  withBundleAnalyzer = analyzer({ enabled: process.env.ANALYZE === 'true' });
} catch (error) {
  if (process.env.ANALYZE === 'true') {
    console.warn('Bundle analyzer is not installed. Run `npm install @next/bundle-analyzer` to enable it.');
  }
}

module.exports = withBundleAnalyzer(nextConfig);
