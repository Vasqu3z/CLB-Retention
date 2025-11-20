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
    drawer: { type: 'spring' as const, stiffness: 280, damping: 30, mass: 0.9 },
    gentle: { type: 'spring' as const, stiffness: 220, damping: 26, mass: 0.9 },
  },
};

export type MotionEasingKey = keyof typeof motionTokens.easings;
export type MotionDurationKey = keyof typeof motionTokens.durations;
