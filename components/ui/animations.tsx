/**
 * Animation Components
 *
 * This module provides reusable animation components that can be used throughout
 * the AttendMe application. Built on top of Framer Motion, these components simplify
 * the implementation of common animations and transitions to create a more dynamic
 * and engaging user experience.
 *
 * Key components:
 * - FadeIn: Fades in elements with optional direction
 * - SlideIn: Slides in elements from a specified direction
 * - ScaleIn: Scales elements from smaller to full size
 * - AnimatePresence: Handles animations for conditionally rendered components
 * - AnimatedList: Creates staggered animations for lists of items
 * - AnimatedCounter: Animates numerical values changing
 *
 * @module components/ui/animations
 *
 * @dependencies
 * - Framer Motion: Used for animation implementation
 * - animation-utils: Custom animation utility functions
 */

"use client"

import React, { ReactNode, useState, useEffect } from "react"
import {
  motion,
  AnimatePresence as FramerAnimatePresence,
  useInView,
  useSpring,
  useScroll,
  useTransform,
  HTMLMotionProps
} from "framer-motion"
import {
  fadeIn,
  fadeInUp,
  fadeInDown,
  slideInLeft,
  slideInRight,
  scaleIn,
  popIn,
  staggeredList,
  DURATION,
  EASING,
  AnimationConfig
} from "@/lib/animation-utils"

/**
 * Direction options for fade animations
 */
export type FadeDirection = "up" | "down" | "left" | "right" | "none"

/**
 * Props for the FadeIn component
 */
export interface FadeInProps extends HTMLMotionProps<"div"> {
  /**
   * Direction of the fade animation
   * @default "none"
   */
  direction?: FadeDirection

  /**
   * Duration of the animation in seconds
   * @default 0.4
   */
  duration?: number

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number

  /**
   * Distance to travel during animation (in pixels)
   * @default 20
   */
  distance?: number

  /**
   * Whether to only animate when element comes into view
   * @default false
   */
  whenInView?: boolean

  /**
   * How much of element needs to be in view before animating (0-1)
   * @default 0.1
   */
  threshold?: number

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * FadeIn Component
 *
 * Animates children by fading them in, optionally from a direction.
 *
 * @example
 * ```tsx
 * <FadeIn direction="up" delay={0.2}>
 *   <h1>Welcome to AttendMe</h1>
 * </FadeIn>
 * ```
 */
export const FadeIn: React.FC<FadeInProps> = ({
  direction = "none",
  duration = DURATION.normal,
  delay = 0,
  distance = 20,
  whenInView = false,
  threshold = 0.1,
  children,
  ...props
}) => {
  // Set up animation variants based on direction
  const getVariants = () => {
    const config: Partial<AnimationConfig> = {
      duration,
      delay
    }

    switch (direction) {
      case "up":
        return fadeInUp(config, distance)
      case "down":
        return fadeInDown(config, distance)
      case "left":
        return slideInLeft(config, distance)
      case "right":
        return slideInRight(config, distance)
      case "none":
      default:
        return fadeIn(config)
    }
  }

  const variants = getVariants()

  // Reference for in-view detection
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: threshold
  })

  // If whenInView is true, only animate when element comes into view
  const shouldAnimate = whenInView
    ? isInView
      ? "animate"
      : "initial"
    : "animate"

  return (
    <motion.div
      ref={whenInView ? ref : undefined}
      initial="initial"
      animate={shouldAnimate}
      exit="exit"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Props for the ScaleIn component
 */
export interface ScaleInProps extends HTMLMotionProps<"div"> {
  /**
   * Starting scale value (0-1)
   * @default 0.95
   */
  startScale?: number

  /**
   * Duration of the animation in seconds
   * @default 0.4
   */
  duration?: number

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number

  /**
   * Whether to only animate when element comes into view
   * @default false
   */
  whenInView?: boolean

  /**
   * How much of element needs to be in view before animating (0-1)
   * @default 0.1
   */
  threshold?: number

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * ScaleIn Component
 *
 * Animates children by scaling them from a smaller size.
 *
 * @example
 * ```tsx
 * <ScaleIn startScale={0.8} delay={0.3}>
 *   <Card>Content</Card>
 * </ScaleIn>
 * ```
 */
export const ScaleIn: React.FC<ScaleInProps> = ({
  startScale = 0.95,
  duration = DURATION.normal,
  delay = 0,
  whenInView = false,
  threshold = 0.1,
  children,
  ...props
}) => {
  const variants = scaleIn({ duration, delay }, startScale)

  // Reference for in-view detection
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: threshold
  })

  // If whenInView is true, only animate when element comes into view
  const shouldAnimate = whenInView
    ? isInView
      ? "animate"
      : "initial"
    : "animate"

  return (
    <motion.div
      ref={whenInView ? ref : undefined}
      initial="initial"
      animate={shouldAnimate}
      exit="exit"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Props for the PopIn component
 */
export interface PopInProps extends HTMLMotionProps<"div"> {
  /**
   * Duration of the animation in seconds
   * @default 0.4
   */
  duration?: number

  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * PopIn Component
 *
 * Animates children with a bouncy pop-in effect, ideal for badges, alerts, or notifications.
 *
 * @example
 * ```tsx
 * <PopIn>
 *   <Badge>New</Badge>
 * </PopIn>
 * ```
 */
export const PopIn: React.FC<PopInProps> = ({
  duration = DURATION.normal,
  delay = 0,
  children,
  ...props
}) => {
  const variants = popIn({ duration, delay })

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/**
 * Props for the AnimatePresence component
 */
export interface AnimatePresenceProps {
  /**
   * Condition that determines whether to show children
   */
  isVisible: boolean

  /**
   * Mode for handling multiple elements ("sync" or "wait")
   * @default "sync"
   */
  mode?: "sync" | "wait"

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * AnimatePresence Component
 *
 * Wrapper around Framer Motion's AnimatePresence that simplifies usage.
 * Handles animations for conditionally rendered components.
 *
 * @example
 * ```tsx
 * <AnimatePresence isVisible={isMenuOpen}>
 *   <FadeIn>
 *     <Menu />
 *   </FadeIn>
 * </AnimatePresence>
 * ```
 */
export const AnimatePresence: React.FC<AnimatePresenceProps> = ({
  isVisible,
  mode = "sync",
  children
}) => {
  return (
    <FramerAnimatePresence mode={mode}>
      {isVisible && children}
    </FramerAnimatePresence>
  )
}

/**
 * Props for the AnimatedList component
 */
export interface AnimatedListProps extends HTMLMotionProps<"ul"> {
  /**
   * Delay before starting animations
   * @default 0.2
   */
  delay?: number

  /**
   * Delay between each child animation
   * @default 0.1
   */
  staggerDelay?: number

  /**
   * Whether to only animate when element comes into view
   * @default false
   */
  whenInView?: boolean

  /**
   * Animation direction for items ("forward" or "backward")
   * @default "forward"
   */
  direction?: "forward" | "backward"

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * AnimatedList Component
 *
 * Creates a staggered animation for lists of items.
 *
 * @example
 * ```tsx
 * <AnimatedList>
 *   {items.map(item => (
 *     <motion.li key={item.id} variants={fadeInUp()}>
 *       {item.name}
 *     </motion.li>
 *   ))}
 * </AnimatedList>
 * ```
 */
export const AnimatedList: React.FC<AnimatedListProps> = ({
  delay = 0.2,
  staggerDelay = 0.1,
  whenInView = false,
  direction = "forward",
  children,
  ...props
}) => {
  const variants = staggeredList({
    delay,
    staggerDelay
  })

  // Reference for in-view detection
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: 0.1
  })

  // If whenInView is true, only animate when element comes into view
  const shouldAnimate = whenInView
    ? isInView
      ? "animate"
      : "initial"
    : "animate"

  return (
    <motion.ul
      ref={whenInView ? ref : undefined}
      initial="initial"
      animate={shouldAnimate}
      exit="exit"
      variants={variants}
      {...props}
      style={{
        ...props.style,
        listStyle: "none",
        padding: 0,
        margin: 0
      }}
    >
      {children}
    </motion.ul>
  )
}

/**
 * Props for the AnimatedCounter component
 */
export interface AnimatedCounterProps {
  /**
   * The final value to count to
   */
  value: number

  /**
   * Duration of the animation in seconds
   * @default 1.5
   */
  duration?: number

  /**
   * Formatter function for the displayed value
   * @default toLocaleString
   */
  formatter?: (value: number) => string

  /**
   * CSS class name
   */
  className?: string
}

/**
 * AnimatedCounter Component
 *
 * Animates a number counting up from 0 to the target value.
 * Useful for statistics, metrics, and other numerical data.
 *
 * @example
 * ```tsx
 * <AnimatedCounter
 *   value={1234}
 *   formatter={(v) => `${v.toLocaleString()}+`}
 * />
 * ```
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  formatter = v => v.toLocaleString(),
  className
}) => {
  const [isClient, setIsClient] = useState(false)

  // Spring animation for smooth counting
  const springValue = useSpring(0, {
    duration: duration * 1000,
    stiffness: 50,
    damping: 15
  })

  // Update spring target when value changes
  useEffect(() => {
    springValue.set(value)
    setIsClient(true)
  }, [value, springValue])

  // Format and display the current value
  const displayValue = Math.round(springValue.get())

  // Show static value on server to avoid hydration issues
  if (!isClient) {
    return <span className={className}>{formatter(value)}</span>
  }

  return (
    <motion.span className={className}>{formatter(displayValue)}</motion.span>
  )
}

/**
 * Props for the ParallaxScroll component
 */
export interface ParallaxScrollProps extends HTMLMotionProps<"div"> {
  /**
   * Strength of the parallax effect (higher = more movement)
   * @default 0.2
   */
  strength?: number

  /**
   * Whether to move up or down on scroll
   * @default true
   */
  up?: boolean

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * ParallaxScroll Component
 *
 * Creates a parallax scrolling effect for its children.
 *
 * @example
 * ```tsx
 * <ParallaxScroll strength={0.3}>
 *   <Image src="/hero.jpg" alt="Hero" />
 * </ParallaxScroll>
 * ```
 */
export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  strength = 0.2,
  up = true,
  children,
  ...props
}) => {
  const { scrollYProgress } = useScroll()

  // Calculate the parallax effect
  const factor = up ? -strength : strength
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${factor * 100}%`])

  return (
    <motion.div style={{ y }} {...props}>
      {children}
    </motion.div>
  )
}

/**
 * Props for the Stagger component
 */
export interface StaggerProps {
  /**
   * Delay before starting animations
   * @default 0.2
   */
  delay?: number

  /**
   * Delay between each child animation
   * @default 0.1
   */
  staggerDelay?: number

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * Stagger Component
 *
 * Wraps children with staggered animation variants for parent-child animations.
 *
 * @example
 * ```tsx
 * <Stagger>
 *   <motion.div variants={fadeIn()}>Item 1</motion.div>
 *   <motion.div variants={fadeIn()}>Item 2</motion.div>
 * </Stagger>
 * ```
 */
export const Stagger: React.FC<StaggerProps> = ({
  delay = 0.2,
  staggerDelay = 0.1,
  children
}) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        staggerChildren: staggerDelay,
        delayChildren: delay
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Props for the TextReveal component
 */
export interface TextRevealProps {
  /**
   * The text to reveal
   */
  text: string

  /**
   * Duration for each character to appear
   * @default 0.05
   */
  speed?: number

  /**
   * Delay before starting animation
   * @default 0
   */
  delay?: number

  /**
   * Tag to use for the text container
   * @default "span"
   */
  as?: keyof JSX.IntrinsicElements

  /**
   * CSS class name
   */
  className?: string
}

/**
 * TextReveal Component
 *
 * Reveals text character by character, creating a typing effect.
 *
 * @example
 * ```tsx
 * <TextReveal
 *   text="AttendMe - The attending in your pocket"
 *   speed={0.03}
 *   delay={0.5}
 * />
 * ```
 */
export const TextReveal: React.FC<TextRevealProps> = ({
  text,
  speed = 0.05,
  delay = 0,
  as: Tag = "span",
  className
}) => {
  const characters = text.split("")

  return (
    <Tag className={className}>
      <Stagger delay={delay} staggerDelay={speed}>
        {characters.map((char, index) => (
          <motion.span
            key={index}
            variants={{
              initial: {
                opacity: 0,
                display: "inline-block"
              },
              animate: {
                opacity: 1,
                display: "inline-block",
                transition: {
                  duration: 0.2
                }
              }
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </Stagger>
    </Tag>
  )
}

/**
 * Props for the ScrollFadeIn component
 */
export interface ScrollFadeInProps {
  /**
   * Threshold for when element should start animating (0-1)
   * @default 0.1
   */
  threshold?: number

  /**
   * Direction to fade in from
   * @default "up"
   */
  direction?: FadeDirection

  /**
   * Distance to travel during animation (in pixels)
   * @default 30
   */
  distance?: number

  /**
   * Margin around the element for triggering animation
   * @default "0px"
   */
  margin?: string

  /**
   * Children elements to animate
   */
  children: ReactNode
}

/**
 * ScrollFadeIn Component
 *
 * Fades in elements as they scroll into view.
 *
 * @example
 * ```tsx
 * <ScrollFadeIn direction="left">
 *   <FeatureCard />
 * </ScrollFadeIn>
 * ```
 */
export const ScrollFadeIn: React.FC<ScrollFadeInProps> = ({
  threshold = 0.1,
  direction = "up",
  distance = 30,
  margin = "0px",
  children
}) => {
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
    margin
  })

  // Set up animation variants based on direction
  const getVariants = () => {
    const config: Partial<AnimationConfig> = { duration: DURATION.normal }

    switch (direction) {
      case "up":
        return fadeInUp(config, distance)
      case "down":
        return fadeInDown(config, distance)
      case "left":
        return slideInLeft(config, distance)
      case "right":
        return slideInRight(config, distance)
      case "none":
      default:
        return fadeIn(config)
    }
  }

  const variants = getVariants()

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}

/**
 * Props for the SlideOver component
 */
export interface SlideOverProps {
  /**
   * Whether the slide-over is open
   */
  isOpen: boolean

  /**
   * Function to close the slide-over
   */
  onClose: () => void

  /**
   * Direction to slide from
   * @default "right"
   */
  direction?: "left" | "right" | "top" | "bottom"

  /**
   * Children elements to display
   */
  children: ReactNode
}

/**
 * SlideOver Component
 *
 * Creates a slide-over panel that animates in from a specified direction.
 *
 * @example
 * ```tsx
 * <SlideOver isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
 *   <div>Slide-over content</div>
 * </SlideOver>
 * ```
 */
export const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  direction = "right",
  children
}) => {
  // Define variants based on direction
  const variants = {
    initial: {
      x: direction === "right" ? "100%" : direction === "left" ? "-100%" : 0,
      y: direction === "bottom" ? "100%" : direction === "top" ? "-100%" : 0,
      opacity: 0
    },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      x: direction === "right" ? "100%" : direction === "left" ? "-100%" : 0,
      y: direction === "bottom" ? "100%" : direction === "top" ? "-100%" : 0,
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: EASING.easeIn
      }
    }
  }

  return (
    <AnimatePresence isVisible={isOpen}>
      <div className="fixed inset-0 z-50 flex overflow-hidden">
        {/* Overlay */}
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Slide-over panel */}
        <motion.div
          className="bg-background absolute z-10 flex size-full max-w-md flex-col overflow-y-auto p-4 shadow-xl sm:p-6"
          style={{
            [direction === "left" || direction === "right"
              ? "width"
              : "height"]: "max-content",
            [direction === "left" ? "left" : "right"]:
              direction === "left" || direction === "right" ? 0 : "auto",
            [direction === "top" ? "top" : "bottom"]:
              direction === "top" || direction === "bottom" ? 0 : "auto"
          }}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/**
 * Props for the TiltEffect component
 */
export interface TiltEffectProps extends HTMLMotionProps<"div"> {
  /**
   * Maximum tilt angle in degrees
   * @default 20
   */
  max?: number

  /**
   * Speed of the tilt effect (lower = slower)
   * @default 500
   */
  speed?: number

  /**
   * Glare effect strength (0-1, 0 = no glare)
   * @default 0
   */
  glare?: number

  /**
   * Element to apply the tilt effect to
   */
  children: ReactNode
}

/**
 * TiltEffect Component
 *
 * Creates a 3D tilt effect on hover for interactive elements.
 *
 * @example
 * ```tsx
 * <TiltEffect max={15} glare={0.3}>
 *   <Card>Card with 3D tilt effect</Card>
 * </TiltEffect>
 * ```
 */
export const TiltEffect: React.FC<TiltEffectProps> = ({
  max = 20,
  speed = 500,
  glare = 0,
  children,
  ...props
}) => {
  const [tiltX, setTiltX] = useState(0)
  const [tiltY, setTiltY] = useState(0)
  const [glareX, setGlareX] = useState(50)
  const [glareY, setGlareY] = useState(50)
  const [isHovered, setIsHovered] = useState(false)

  // Handle mouse movement over the element
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovered) return

    const rect = e.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Calculate mouse position relative to center
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    // Calculate tilt angles
    const tiltX = (mouseY / (rect.height / 2)) * max
    const tiltY = -(mouseX / (rect.width / 2)) * max

    // Calculate glare position
    const glareX = ((e.clientX - rect.left) / rect.width) * 100
    const glareY = ((e.clientY - rect.top) / rect.height) * 100

    setTiltX(tiltX)
    setTiltY(tiltY)
    setGlareX(glareX)
    setGlareY(glareY)
  }

  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    setIsHovered(false)
    setTiltX(0)
    setTiltY(0)
  }

  // Set hover state when mouse enters
  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <motion.div
      {...props}
      style={{
        perspective: `${speed}px`,
        transformStyle: "preserve-3d",
        ...props.style
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      animate={{
        rotateX: tiltX,
        rotateY: tiltY,
        transition: { duration: 0.15 }
      }}
    >
      {children}

      {/* Optional glare effect */}
      {glare > 0 && isHovered && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,${glare}) 0%, rgba(255,255,255,0) 60%)`,
            pointerEvents: "none"
          }}
        />
      )}
    </motion.div>
  )
}

/**
 * Props for the ProgressIndicator component
 */
export interface ProgressIndicatorProps {
  /**
   * Current progress value (0-1)
   */
  progress: number

  /**
   * Whether to animate the progress change
   * @default true
   */
  animate?: boolean

  /**
   * Animation duration in seconds
   * @default 0.6
   */
  duration?: number

  /**
   * CSS class name
   */
  className?: string
}

/**
 * ProgressIndicator Component
 *
 * Displays an animated progress bar that smoothly transitions between values.
 *
 * @example
 * ```tsx
 * <ProgressIndicator progress={0.75} />
 * ```
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  animate = true,
  duration = 0.6,
  className
}) => {
  // Ensure progress is between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress))

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
        className
      )}
    >
      <motion.div
        className="bg-primary h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress * 100}%` }}
        transition={animate ? { duration } : { duration: 0 }}
      />
    </div>
  )
}

/**
 * Helper function to conditionally add classes
 */
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
