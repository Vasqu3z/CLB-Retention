'use client';

import { useEffect, useRef } from 'react';

export default function SmoothScroll() {
  const rafRef = useRef<number>();

  useEffect(() => {
    let lenisInstance: { raf: (time: number) => void; destroy: () => void; stop: () => void; start: () => void } | null = null;
    let disposed = false;

    const shouldEnable = () => {
      if (typeof window === 'undefined') return false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
      return window.matchMedia('(pointer: fine)').matches;
    };

    if (!shouldEnable()) {
      return;
    }

    const stopRaf = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = undefined;
      }
    };

    const runRaf = () => {
      const animate = (time: number) => {
        lenisInstance?.raf(time);
        rafRef.current = requestAnimationFrame(animate);
      };
      rafRef.current = requestAnimationFrame(animate);
    };

    const startLenis = async () => {
      if (lenisInstance || disposed) return;
      const { default: Lenis } = await import('lenis');
      lenisInstance = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.9,
        autoRaf: false,
      });

      runRaf();

      const handleVisibility = () => {
        if (!lenisInstance) return;
        if (document.hidden) {
          lenisInstance.stop();
          stopRaf();
        } else {
          lenisInstance.start();
          runRaf();
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);

      cleanupFns.push(() => {
        document.removeEventListener('visibilitychange', handleVisibility);
      });
    };

    const cleanupFns: Array<() => void> = [];

    const triggerOnce = () => {
      window.removeEventListener('wheel', triggerOnce);
      window.removeEventListener('keydown', triggerOnce);
      window.removeEventListener('pointerdown', triggerOnce);
      startLenis();
    };

    window.addEventListener('wheel', triggerOnce, { once: true, passive: true });
    window.addEventListener('keydown', triggerOnce, { once: true });
    window.addEventListener('pointerdown', triggerOnce, { once: true });

    cleanupFns.push(() => {
      window.removeEventListener('wheel', triggerOnce);
      window.removeEventListener('keydown', triggerOnce);
      window.removeEventListener('pointerdown', triggerOnce);
    });

    return () => {
      disposed = true;
      cleanupFns.forEach((fn) => fn());
      stopRaf();
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, []);

  return null;
}
