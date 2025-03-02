/**
 * Animation Utilities
 *
 * This module provides utility functions and constants for animations
 * throughout the AttendMe application. It centralizes animation variants,
 * timing functions, and helper utilities to ensure consistency across
 * the application's UI.
 *
 * Key features:
 * - Predefined animation variants for common animations (fade, slide, etc.)
 * - Staggered animation helpers for lists and grids
 * - Timing and easing function constants
 * - Type definitions for animation properties
 *
 * @module lib/animation-utils
 */

import { Variants } from "framer-motion"

/**
 * Standard animation durations in seconds
 */
export const DURATION = {
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  extraSlow: 1.0
}

/**
 * Common easing functions for smooth animations
 */
export const EASING = {
  // Standard easing curves
  easeOut: [0.16, 1, 0.3, 1], // Material design "standard curve"
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1],

  // Bounce and elastic easings
  bounceOut: [0.22, 1.2, 0.36, 1], // Slight bounce at the end
  elastic: [0.68, -0.55, 0.27, 1.55], // Elastic/springy feel

  // Sharp movement
  sharp: [0.4, 0, 0.6, 1] // Quick in, quick out
}

/**
 * Interface for animation configuration options
 */
export interface AnimationConfig {
  /**
   * Duration of the animation in seconds
   * @default 0.4
   */
  duration?: number

  /**
   * Easing function to use
   * @default EASING.easeOut
   */
  ease?: number[] | string

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number

  /**
   * Whether the animation should occur when the component enters the viewport
   * @default false
   */
  useViewport?: boolean

  /**
   * Amount of the element that needs to be in view before animating (0-1)
   * @default 0.1
   */
  threshold?: number

  /**
   * Whether to use staggered animation for child elements
   * @default false
   */
  staggerChildren?: boolean

  /**
   * The delay between each child animation when staggering
   * @default 0.05
   */
  staggerDelay?: number
}

/**
 * Default animation configuration
 */
export const DEFAULT_CONFIG: AnimationConfig = {
  duration: DURATION.normal,
  ease: EASING.easeOut,
  delay: 0,
  useViewport: false,
  threshold: 0.1,
  staggerChildren: false,
  staggerDelay: 0.05
}

/**
 * Fade in animation variants
 *
 * @param config - Animation configuration options
 * @returns Framer Motion variants for fade in animation
 */
export function fadeIn(config: Partial<AnimationConfig> = {}): Variants {
  const { duration, ease, delay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration,
        ease,
        delay
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: duration * 0.75,
        ease
      }
    }
  }
}

/**
 * Fade in up animation variants (fade in while moving up)
 *
 * @param config - Animation configuration options
 * @param distance - Distance to travel in pixels
 * @returns Framer Motion variants for fade in up animation
 */
export function fadeInUp(
  config: Partial<AnimationConfig> = {},
  distance: number = 20
): Variants {
  const { duration, ease, delay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { opacity: 0, y: distance },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease,
        delay
      }
    },
    exit: {
      opacity: 0,
      y: distance,
      transition: {
        duration: duration * 0.75,
        ease
      }
    }
  }
}

/**
 * Fade in down animation variants (fade in while moving down)
 *
 * @param config - Animation configuration options
 * @param distance - Distance to travel in pixels
 * @returns Framer Motion variants for fade in down animation
 */
export function fadeInDown(
  config: Partial<AnimationConfig> = {},
  distance: number = 20
): Variants {
  const { duration, ease, delay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { opacity: 0, y: -distance },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease,
        delay
      }
    },
    exit: {
      opacity: 0,
      y: -distance,
      transition: {
        duration: duration * 0.75,
        ease
      }
    }
  }
}

/**
 * Slide in right animation variants
 *
 * @param config - Animation configuration options
 * @param distance - Distance to travel in pixels
 * @returns Framer Motion variants for slide in right animation
 */
export function slideInRight(
  config: Partial<AnimationConfig> = {},
  distance: number = 50
): Variants {
  const { duration, ease, delay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { x: -distance, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration,
        ease,
        delay
      }
    },
    exit: {
      x: -distance,
      opacity: 0,
      transition: {
        duration: duration * 0.75,
        ease
      }
    }
  }
}

/**
 * Slide in left animation variants
 *
 * @param config - Animation configuration options
 * @param distance - Distance to travel in pixels
 * @returns Framer Motion variants for slide in left animation
 */
export function slideInLeft(
  config: Partial<AnimationConfig> = {},
  distance: number = 50
): Variants {
  const { duration, ease, delay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { x: distance, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration,
        ease,
        delay
      }
    },
    exit: {
      x: distance,
      opacity: 0,
      transition: {
        duration: duration * 0.75,
        ease
      }
    }
  }
}

/**
 * Scale in animation variants (grow from smaller size)
 *
 * @param config - Animation configuration options
 * @param startScale - Starting scale (0-1)
 * @returns Framer Motion variants for scale in animation
 */
export function scaleIn(
  config: Partial<AnimationConfig> = {},
  startScale: number = 0.95
): Variants {
  const { duration, ease, delay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { scale: startScale, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration,
        ease,
        delay
      }
    },
    exit: {
      scale: startScale,
      opacity: 0,
      transition: {
        duration: duration * 0.75,
        ease
      }
    }
  }
}

/**
 * Staggered children animation variant
 *
 * @param config - Animation configuration options
 * @param childVariants - Variants to apply to children
 * @returns Framer Motion variants for container with staggered children
 */
export function staggerChildren(
  config: Partial<AnimationConfig> = {},
  childVariants: Variants = fadeIn()
): Variants {
  const { delay, staggerDelay } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: "initial",
    animate: {
      transition: {
        delayChildren: delay,
        staggerChildren: staggerDelay
      }
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1
      }
    },
    ...childVariants
  }
}

/**
 * Creates animation variants for a list that enters item by item
 *
 * @param config - Animation configuration options
 * @returns Framer Motion variants for staggered list animation
 */
export function staggeredList(config: Partial<AnimationConfig> = {}): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        delayChildren: config.delay || 0.2,
        staggerChildren: config.staggerDelay || 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: (config.staggerDelay || 0.1) / 2,
        staggerDirection: -1
      }
    }
  }
}

/**
 * Creates animation variants for a grid that enters by cells
 *
 * @param config - Animation configuration options
 * @param columns - Number of columns in the grid
 * @returns Framer Motion variants for staggered grid animation
 */
export function staggeredGrid(
  config: Partial<AnimationConfig> = {},
  columns: number = 3
): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        delayChildren: config.delay || 0.2,
        staggerChildren: config.staggerDelay || 0.05,
        // Using negative number makes the animation go column by column
        staggerDirection: -1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: (config.staggerDelay || 0.05) / 2
      }
    }
  }
}

/**
 * Creates animation variants for a badge/pill that pops in
 *
 * @param config - Animation configuration options
 * @returns Framer Motion variants for pop-in animation
 */
export function popIn(config: Partial<AnimationConfig> = {}): Variants {
  const { duration, ease } = {
    ...DEFAULT_CONFIG,
    ...config,
    ease: EASING.elastic
  }

  return {
    initial: { scale: 0.5, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
        duration
      }
    },
    exit: {
      scale: 0.5,
      opacity: 0,
      transition: {
        duration: duration * 0.5,
        ease: EASING.easeIn
      }
    }
  }
}

/**
 * Creates animation variants for a page transition
 *
 * @param config - Animation configuration options
 * @returns Framer Motion variants for page transition
 */
export function pageTransition(
  config: Partial<AnimationConfig> = {}
): Variants {
  const { duration, ease } = { ...DEFAULT_CONFIG, ...config }

  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration,
        ease,
        when: "beforeChildren"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: duration * 0.5,
        ease: EASING.easeIn
      }
    }
  }
}

/**
 * Utility to create a spring animation configuration
 *
 * @param stiffness - Spring stiffness (higher = more rigid)
 * @param damping - Spring damping (higher = less bounce)
 * @param mass - Spring mass (higher = more momentum)
 * @param delay - Delay before animation starts
 * @returns Spring animation configuration
 */
export function spring(
  stiffness: number = 400,
  damping: number = 17,
  mass: number = 1,
  delay: number = 0
) {
  return {
    type: "spring",
    stiffness,
    damping,
    mass,
    delay
  }
}

/**
 * Creates hover animation props for components
 *
 * @param scale - Scale factor on hover (1 = no scale)
 * @param duration - Animation duration in seconds
 * @returns Hover animation props for Framer Motion
 */
export function hoverAnimation(scale: number = 1.05, duration: number = 0.2) {
  return {
    whileHover: { scale },
    transition: { duration }
  }
}

/**
 * Creates tap animation props for interactive components
 *
 * @param scale - Scale factor on tap (should be less than 1)
 * @returns Tap animation props for Framer Motion
 */
export function tapAnimation(scale: number = 0.95) {
  return {
    whileTap: { scale },
    transition: { duration: 0.1 }
  }
}

/**
 * Combines multiple animation variants
 *
 * @param variants - Array of animation variants to combine
 * @returns Combined animation variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((combined, variant) => {
    return {
      ...combined,
      ...variant,
      initial: { ...combined.initial, ...variant.initial },
      animate: { ...combined.animate, ...variant.animate },
      exit: { ...combined.exit, ...variant.exit }
    }
  }, {} as Variants)
}
