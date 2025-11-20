import { motionTokens } from './motionTokens';

export const overlayVariants = (prefersReducedMotion = false) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: prefersReducedMotion ? 0 : motionTokens.durations.base,
      ease: motionTokens.easings.smoothEaseOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: prefersReducedMotion ? 0 : motionTokens.durations.fast,
      ease: motionTokens.easings.smoothEaseOut,
    },
  },
});

export const drawerVariants = (prefersReducedMotion = false) => ({
  hidden: { x: prefersReducedMotion ? 0 : '100%', opacity: prefersReducedMotion ? 1 : 1 },
  visible: {
    x: 0,
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          ...motionTokens.springs.drawer,
          duration: motionTokens.durations.extended,
        },
  },
  exit: {
    x: prefersReducedMotion ? 0 : '100%',
    opacity: prefersReducedMotion ? 1 : 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          ...motionTokens.springs.drawer,
          duration: motionTokens.durations.base,
        },
  },
});

export const sectionEntranceVariants = (prefersReducedMotion = false) => ({
  hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0 : motionTokens.durations.extended,
      ease: motionTokens.easings.smoothEaseOut,
    },
  },
});

export const cardHoverVariants = (prefersReducedMotion = false) => ({
  rest: {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    y: 0,
    transition: {
      duration: motionTokens.durations.fast,
      ease: motionTokens.easings.smoothEaseOut,
    },
  },
  hover: prefersReducedMotion
    ? {
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        scale: 1,
        y: 0,
        transition: { duration: 0 },
      }
    : {
        rotateX: -2,
        rotateY: 2,
        rotateZ: 0,
        scale: 1.02,
        y: -6,
        transition: {
          duration: motionTokens.durations.base,
          ease: motionTokens.easings.spring,
        },
      },
});

export const navItemVariants = (prefersReducedMotion = false) => ({
  hidden: { opacity: prefersReducedMotion ? 1 : 0, x: prefersReducedMotion ? 0 : 12 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: prefersReducedMotion ? 0 : delay,
      duration: prefersReducedMotion ? 0 : motionTokens.durations.base,
      ease: motionTokens.easings.smoothEaseOut,
    },
  }),
});

export const pageTransitionVariants = (prefersReducedMotion = false) => ({
  hidden: { opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: prefersReducedMotion ? 0 : motionTokens.durations.extended,
      ease: motionTokens.easings.smoothEaseOut,
    },
  },
  exit: {
    opacity: prefersReducedMotion ? 1 : 0,
    y: prefersReducedMotion ? 0 : -12,
    transition: {
      duration: prefersReducedMotion ? 0 : motionTokens.durations.fast,
      ease: motionTokens.easings.smoothEaseOut,
    },
  },
});
