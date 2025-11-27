"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RetroTooltip - Base arcade-style tooltip component
 *
 * Diegetic design: HUD-style data popup with scanlines and neon glow
 * Provides positioning, animation, and styling mechanics for all tooltip types
 *
 * Usage: Wrap your trigger element and provide tooltip content
 */

interface RetroTooltipProps {
  /** Content to display inside the tooltip */
  content: React.ReactNode;
  /** Element that triggers the tooltip (wrapped) */
  children: React.ReactNode;
  /** Optional accent color for border and glow (defaults to cyan) */
  accentColor?: string;
  /** Optional title for the tooltip */
  title?: string;
  /** Whether to show the tooltip */
  isOpen?: boolean;
  /** Callback when tooltip visibility changes */
  onOpenChange?: (isOpen: boolean) => void;
}

export default function RetroTooltip({
  content,
  children,
  accentColor = "#00F3FF", // comets-cyan
  title,
  isOpen: controlledIsOpen,
  onOpenChange,
}: RetroTooltipProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (controlledIsOpen === undefined) {
      setInternalIsOpen(value);
    }
    onOpenChange?.(value);
  };

  // Ensure component is mounted (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position when tooltip becomes visible
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8,
        left: rect.left + rect.width / 2,
      });
    }
  }, [isOpen]);

  const renderTooltip = () => {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: -12, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed -translate-x-1/2 -translate-y-full z-[9999] pointer-events-none"
          style={{ top: `${position.top}px`, left: `${position.left}px` }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 blur-xl rounded-lg"
            style={{ backgroundColor: `${accentColor}33` }} // 20% opacity
          />

          {/* Tooltip card */}
          <div
            className="relative bg-surface-dark border-2 rounded-lg px-4 py-2 shadow-2xl overflow-hidden"
            style={{ borderColor: `${accentColor}80` }} // 50% opacity
          >
            {/* Scanlines */}
            <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 whitespace-nowrap">
              {title && (
                <div
                  className="font-ui text-xs uppercase tracking-[0.2em] font-bold mb-0.5"
                  style={{ color: accentColor }}
                >
                  {title}
                </div>
              )}
              <div className="font-body text-xs text-white/90">{content}</div>
            </div>

            {/* Corner accent */}
            <motion.div
              className="absolute top-0 right-0 w-8 h-8"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div
                className="w-full h-full bg-gradient-to-bl to-transparent"
                style={{ backgroundImage: `linear-gradient(to bottom left, ${accentColor}4D, transparent)` }}
              />
            </motion.div>

            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div
                className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                style={{ borderTopColor: `${accentColor}80` }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  };

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </div>

      {/* Tooltip popup (portaled to document.body) */}
      {renderTooltip()}
    </>
  );
}
