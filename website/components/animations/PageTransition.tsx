'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import useReducedMotion from '@/hooks/useReducedMotion';
import { pageTransitionVariants } from './motionVariants';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const variants = pageTransitionVariants(prefersReducedMotion);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
