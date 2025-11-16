# Website Performance Optimization Guide

This document contains recommended performance optimizations for the Comets League Baseball website. These are not critical issues but could improve load times and user experience if performance becomes a concern.

## Current Performance Status

The site is already well-optimized with:
- ✅ Next.js 15 with App Router
- ✅ React Server Components (RSC)
- ✅ Incremental Static Regeneration (ISR) with 60s revalidation
- ✅ Dynamic imports for client components
- ✅ Optimized images with next/image

## Future Optimizations

### 1. Font Loading Optimization

**Current State**: Using 4 custom fonts (Chakra Petch, Azeret Mono, JetBrains Mono, Orbitron)

**Recommendations**:
```typescript
// In app/layout.tsx or a font configuration file
import { Chakra_Petch, Azeret_Mono, JetBrains_Mono, Orbitron } from 'next/font/google';

const chakraPetch = Chakra_Petch({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap', // Prevents invisible text during load
  preload: true,
  variable: '--font-display',
});

// Apply font-display: swap to all fonts
// Consider font subsetting to only include needed characters
// Preload critical fonts in metadata
```

**Expected Impact**:
- Faster First Contentful Paint (FCP)
- Reduced Cumulative Layout Shift (CLS)
- ~200-400ms improvement on initial load

---

### 2. Image Optimization

**Current State**: Team logos loaded via teamLogos utility

**Recommendations**:
- Convert PNG logos to WebP/AVIF format (60-80% smaller)
- Add blur placeholders for better perceived performance
- Implement lazy loading for below-fold images

```typescript
// Example implementation
<Image
  src={teamLogo}
  alt={teamName}
  width={64}
  height={64}
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..." // Generated blur placeholder
  loading="lazy" // For below-fold images
/>
```

**Expected Impact**:
- 60-80% reduction in image payload size
- Better perceived performance with blur placeholders
- ~500ms-1s improvement on image-heavy pages

---

### 3. Component-Level Optimizations

**Current State**: DataTable re-renders on every sort

**Recommendations**:

```typescript
// Memoize expensive calculations in DataTable
import { useMemo } from 'react';

const sortedData = useMemo(() => {
  if (!sortKey) return data;
  return [...data].sort((a, b) => {
    // sorting logic
  });
}, [data, sortKey, sortDirection]);

// Memoize row rendering
const MemoizedRow = memo(({ row, columns }) => {
  // row rendering logic
});
```

**Expected Impact**:
- Smoother sorting interactions
- Reduced CPU usage on large tables
- Better performance on mobile devices

---

### 4. Animation Library Code-Splitting

**Current State**: Framer Motion loaded on all pages

**Recommendations**:

```typescript
// Lazy load Framer Motion for non-critical animations
import dynamic from 'next/dynamic';

const AnimatedComponent = dynamic(
  () => import('./AnimatedComponent'),
  { ssr: false } // Skip SSR for animation-heavy components
);

// Or use dynamic imports for motion components
const motion = {
  div: dynamic(() => import('framer-motion').then(mod => mod.motion.div)),
};
```

**Expected Impact**:
- ~30-50KB reduction in initial bundle
- Faster time to interactive
- Animations still load quickly via code-splitting

---

### 5. Three.js Background Optimization

**Current State**: AnimatedBackground with Three.js shader

**Recommendations**:

```typescript
// Lazy load the background
const AnimatedBackground = dynamic(
  () => import('@/components/AnimatedBackground'),
  { ssr: false }
);

// Consider reducing shader complexity on mobile
// Use lower resolution render target on smaller screens
// Pause animation when tab is not visible
```

**Expected Impact**:
- ~100KB+ reduction in initial bundle
- Better performance on low-end devices
- Reduced battery drain on mobile

---

### 6. Bundle Analysis

**Setup**:
```bash
npm install --save-dev @next/bundle-analyzer

# In next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

**What to Look For**:
- Large dependencies that could be replaced
- Duplicate packages
- Unused code that can be tree-shaken
- Opportunities for code-splitting

---

### 7. API Response Caching

**Current State**: Google Sheets API with 60s ISR

**Recommendations**:
- Consider Redis/Vercel KV for faster cache reads
- Implement stale-while-revalidate pattern
- Add response compression

```typescript
// Example with Vercel KV
import { kv } from '@vercel/kv';

export async function getStandings() {
  const cached = await kv.get('standings');
  if (cached) return cached;

  const fresh = await fetchFromGoogleSheets();
  await kv.set('standings', fresh, { ex: 60 });
  return fresh;
}
```

**Expected Impact**:
- Sub-100ms API responses from cache
- Reduced Google Sheets API quota usage
- Better reliability during high traffic

---

### 8. Critical CSS Inlining

**Recommendations**:
- Inline critical above-the-fold CSS
- Defer non-critical stylesheets
- Use CSS containment for isolated components

```css
/* Example of CSS containment */
.glass-card {
  contain: layout style paint;
}
```

**Expected Impact**:
- Faster First Contentful Paint
- Reduced render-blocking resources
- Better Lighthouse scores

---

## Performance Monitoring

**Recommended Tools**:
1. **Vercel Analytics** - Built-in real user monitoring
2. **Lighthouse CI** - Automated performance testing
3. **Web Vitals** - Track Core Web Vitals

```typescript
// Add Web Vitals reporting
// In app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Performance Benchmarks (Current)

**Estimated Metrics** (without optimizations):
- First Contentful Paint (FCP): ~1.2-1.8s
- Largest Contentful Paint (LCP): ~2.0-3.0s
- Time to Interactive (TTI): ~2.5-3.5s
- Total Blocking Time (TBT): ~200-400ms
- Cumulative Layout Shift (CLS): ~0.05-0.10

**Target Metrics** (with optimizations):
- First Contentful Paint (FCP): <1.0s
- Largest Contentful Paint (LCP): <1.5s
- Time to Interactive (TTI): <2.0s
- Total Blocking Time (TBT): <200ms
- Cumulative Layout Shift (CLS): <0.05

---

## Priority Recommendations

If performance becomes an issue, implement in this order:

1. **High Priority**: Font loading optimization (`font-display: swap`)
2. **High Priority**: Image format conversion (WebP/AVIF)
3. **Medium Priority**: Three.js lazy loading
4. **Medium Priority**: Bundle analysis and code-splitting
5. **Low Priority**: Component memoization
6. **Low Priority**: CSS optimization

---

## Notes

- Current performance is good for a stats-heavy site with animations
- These optimizations are "nice-to-haves" not critical fixes
- Monitor real user metrics before implementing
- Test on low-end devices and slow 3G connections
- Consider implementing during low-traffic periods

---

**Last Updated**: 2025-11-16
**Next Review**: When performance issues are reported or traffic increases significantly
