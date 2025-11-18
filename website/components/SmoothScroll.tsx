'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hasFinePointer = window.matchMedia('(pointer: fine)');

    if (prefersReducedMotion.matches || !hasFinePointer.matches) {
      return;
    }

    let lenis: { raf: (time: number) => void; destroy: () => void } | null = null;
    let frameId: number | null = null;
    let loop: ((time: number) => void) | null = null;
    let initialized = false;

    const startLoop = async () => {
      if (initialized) return;
      initialized = true;

      const { default: Lenis } = await import('lenis');
      lenis = new Lenis({
        duration: 1.1,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
        autoRaf: false,
      });

      loop = (time: number) => {
        lenis?.raf(time);
        frameId = requestAnimationFrame(loop!);
      };

      frameId = requestAnimationFrame(loop);
    };

    const handleVisibilityChange = () => {
      if (!loop || !lenis) return;

      if (document.hidden) {
        if (frameId) {
          cancelAnimationFrame(frameId);
          frameId = null;
        }
      } else if (!frameId) {
        frameId = requestAnimationFrame(loop);
      }
    };

    type InteractionOption = AddEventListenerOptions | boolean | undefined;
    const interactionEvents: Array<[keyof WindowEventMap, InteractionOption]> = [
      ['wheel', { once: true, passive: true }],
      ['touchstart', { once: true, passive: true }],
      ['pointerdown', { once: true }],
      ['keydown', { once: true }],
    ];

    const getCaptureValue = (options: InteractionOption) =>
      typeof options === 'boolean' ? options : Boolean(options?.capture);

    interactionEvents.forEach(([event, options]) => {
      window.addEventListener(event, startLoop, options);
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      interactionEvents.forEach(([event, options]) => {
        window.removeEventListener(event, startLoop, getCaptureValue(options));
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
      lenis?.destroy();
    };
  }, []);

  return null;
}
