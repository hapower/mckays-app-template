/**
 * Container Component
 *
 * A responsive container component that centers content and applies consistent
 * horizontal padding. This component is used throughout the application to maintain
 * a consistent layout width.
 *
 * @module components/ui/container
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Props for the Container component
 *
 * @property {React.ReactNode} children - The content to be rendered inside the container
 * @property {string} [className] - Additional CSS classes to apply to the container
 * @property {string} [maxWidth] - Maximum width constraint for the container ("sm", "md", "lg", "xl", "2xl")
 * @property {React.ComponentPropsWithoutRef<"div">} [props] - Any other props to pass to the div element
 */
interface ContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

/**
 * Container component for controlling content width and padding
 *
 * @param {ContainerProps} props - Component props
 * @returns {React.ReactElement} A div with appropriate max-width and padding
 *
 * @example
 * ```tsx
 * <Container maxWidth="lg">
 *   <p>Content with large max-width constraint</p>
 * </Container>
 * ```
 */
export function Container({
  children,
  className,
  maxWidth = "lg",
  ...props
}: ContainerProps) {
  // Map of max-width values to corresponding Tailwind classes
  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full"
  }

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6",
        maxWidthClasses[maxWidth],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
