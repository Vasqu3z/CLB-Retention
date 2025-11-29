"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  shape: 'square' | 'circle' | 'star';
  velocityX: number;
  velocityY: number;
  delay: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number; // How long the confetti runs (ms)
  particleCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const TEAM_COLORS = [
  '#F4D03F', // Comets Yellow
  '#00F3FF', // Comets Cyan
  '#FF4D4D', // Comets Red
  '#BD00FF', // Comets Purple
  '#2ECC71', // Green
  '#FFFFFF', // White
];

/**
 * Confetti - Celebratory particle effect component
 *
 * Usage:
 * <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />
 */
export default function Confetti({
  isActive,
  duration = 5000,
  particleCount = 100,
  colors = TEAM_COLORS,
  onComplete,
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    const shapes: Particle['shape'][] = ['square', 'circle', 'star'];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100, // percentage
        y: -10 - Math.random() * 20, // start above viewport
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 10,
        rotation: Math.random() * 360,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: 2 + Math.random() * 3,
        delay: Math.random() * 0.5,
      });
    }

    setParticles(newParticles);
  }, [particleCount, colors]);

  useEffect(() => {
    if (isActive) {
      generateParticles();

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setParticles([]);
    }
  }, [isActive, duration, generateParticles, onComplete]);

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              width: particle.size,
              height: particle.size,
            }}
            initial={{
              y: `${particle.y}vh`,
              x: 0,
              rotate: 0,
              opacity: 1,
              scale: 0,
            }}
            animate={{
              y: '120vh',
              x: [0, particle.velocityX * 50, particle.velocityX * 100],
              rotate: [particle.rotation, particle.rotation + 720],
              opacity: [1, 1, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: particle.delay,
              ease: 'easeOut',
            }}
            exit={{ opacity: 0 }}
          >
            <ParticleShape
              shape={particle.shape}
              color={particle.color}
              size={particle.size}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ParticleShape({
  shape,
  color,
  size,
}: {
  shape: Particle['shape'];
  color: string;
  size: number;
}) {
  if (shape === 'circle') {
    return (
      <div
        className="rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: `0 0 ${size}px ${color}80`,
        }}
      />
    );
  }

  if (shape === 'star') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{ filter: `drop-shadow(0 0 ${size / 2}px ${color}80)` }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }

  // Default: square
  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        boxShadow: `0 0 ${size}px ${color}80`,
        transform: 'rotate(45deg)',
      }}
    />
  );
}

/**
 * useConfetti - Hook for triggering confetti
 *
 * Usage:
 * const { triggerConfetti, ConfettiComponent } = useConfetti();
 * <button onClick={triggerConfetti}>Celebrate!</button>
 * {ConfettiComponent}
 */
export function useConfetti(options?: Omit<ConfettiProps, 'isActive'>) {
  const [isActive, setIsActive] = useState(false);

  const triggerConfetti = useCallback(() => {
    setIsActive(true);
  }, []);

  const stopConfetti = useCallback(() => {
    setIsActive(false);
  }, []);

  const ConfettiComponent = (
    <Confetti
      isActive={isActive}
      onComplete={stopConfetti}
      {...options}
    />
  );

  return {
    triggerConfetti,
    stopConfetti,
    isActive,
    ConfettiComponent,
  };
}

/**
 * ConfettiButton - A button that triggers confetti on click
 * Useful for testing or one-off celebrations
 */
export function ConfettiButton({
  children = 'Celebrate!',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { triggerConfetti, ConfettiComponent } = useConfetti();

  return (
    <>
      <button onClick={triggerConfetti} {...props}>
        {children}
      </button>
      {ConfettiComponent}
    </>
  );
}
