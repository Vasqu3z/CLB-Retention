'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import useReducedMotion from '@/hooks/useReducedMotion';
import { motionTokens } from './motionTokens';

interface TiltProps {
  children: ReactNode;
  className?: string;
  tiltAngle?: number;
}

export default function Tilt({
  children,
  className = '',
  tiltAngle = 5,
}: TiltProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={
        prefersReducedMotion
          ? { rotateX: 0, rotateY: 0, scale: 1 }
          : { rotateX: tiltAngle, rotateY: tiltAngle, scale: 1.02 }
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: motionTokens.durations.fast, ease: motionTokens.easings.fastResponse }
      }
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {children}
    </motion.div>
  );
}
