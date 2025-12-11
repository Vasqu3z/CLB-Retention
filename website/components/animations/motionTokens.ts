export const motionTokens = {
  durations: {
    ultraFast: 0.12, // 120ms for responsive feedback
    fast: 0.18, // 180ms for hover/press states
    base: 0.22, // 220ms for most UI transitions
    extended: 0.28, // 280ms for larger movements within the 300ms cap
  },
  easings: {
    spring: [0.18, 0.78, 0.42, 1] as const,
    smoothEaseOut: [0.33, 1, 0.68, 1] as const,
    fastResponse: [0.12, 0, 0.39, 0] as const,
  },
  springs: {
    // Standard spring - use for most interactive elements
    standard: { type: 'spring' as const, stiffness: 300, damping: 25 },
    // Drawer spring - slightly stiffer for panels/drawers
    drawer: { type: 'spring' as const, stiffness: 280, damping: 30, mass: 0.9 },
    // Gentle spring - for subtle animations
    gentle: { type: 'spring' as const, stiffness: 220, damping: 26, mass: 0.9 },
    // Snappy spring - for quick feedback
    snappy: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
  // Standard scale values for interactive elements
  scales: {
    // Hover states
    hoverButton: 1.05,
    hoverCard: 1.03,
    hoverIcon: 1.1,
    // Tap/press states
    tap: 0.95,
    // Generic hover for small elements
    hoverSmall: 1.02,
  },
  // Standard Y displacement for page transitions
  pageTransition: {
    yOffset: 20,
  },
};

export type MotionEasingKey = keyof typeof motionTokens.easings;
export type MotionDurationKey = keyof typeof motionTokens.durations;
export type MotionSpringKey = keyof typeof motionTokens.springs;
export type MotionScaleKey = keyof typeof motionTokens.scales;
