'use client';

import { useRef } from 'react';

/**
 * Legacy hook - previously used for Lenis scroll lock workarounds.
 * Now just returns a ref for components that still reference it.
 * Can be replaced with useRef directly in consuming components.
 */
export default function useLenisScrollLock<T extends HTMLElement>() {
  return useRef<T>(null);
}
