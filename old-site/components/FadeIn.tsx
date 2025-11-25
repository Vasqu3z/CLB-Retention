'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import useReducedMotion from '@/hooks/useReducedMotion';
import { motionTokens } from './motionTokens';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  useViewport?: boolean;
  viewportMargin?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = motionTokens.durations.extended,
  direction = 'up',
  className = '',
  useViewport = true,
  viewportMargin = '-100px',
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
    none: { y: 0, x: 0 },
  };

  const animateProps = {
    opacity: 1,
    y: 0,
    x: 0,
  };

  return (
    <motion.div
      className={className}
      initial={{
        opacity: prefersReducedMotion ? 1 : 0,
        ...(prefersReducedMotion ? directions.none : directions[direction]),
      }}
      {...(useViewport && !prefersReducedMotion
        ? { whileInView: animateProps, viewport: { once: true, margin: viewportMargin } }
        : { animate: animateProps }
      )}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: motionTokens.easings.smoothEaseOut,
      }}
    >
      {children}
    </motion.div>
  );
}
