'use client';

import { useEffect, useRef } from 'react';

export default function useLenisScrollLock<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.setAttribute('data-lenis-prevent', '');
    const hoverState = { current: false };

    const handleMouseEnter = () => {
      hoverState.current = true;
    };

    const handleMouseLeave = () => {
      hoverState.current = false;
    };

    const handleWheel = (event: WheelEvent) => {
      event.stopPropagation();
      if (!hoverState.current) {
        event.preventDefault();
      }
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('wheel', handleWheel);
      container.removeAttribute('data-lenis-prevent');
    };
  }, []);

  return ref;
}
