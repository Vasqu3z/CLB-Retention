'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

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
  return (
    <motion.div
      className={className}
      whileHover={{
        rotateX: tiltAngle,
        rotateY: tiltAngle,
        scale: 1.02,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {children}
    </motion.div>
  );
}
