/**
 * Logo Component
 *
 * Renders the AttendMe logo with optional text. This component is used in the
 * header, sidebar, and other areas where brand representation is needed.
 *
 * @module components/ui/logo
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

/**
 * Props for the Logo component
 *
 * @property {string} [className] - Additional CSS classes
 * @property {boolean} [showText] - Whether to display the logo text alongside the icon
 * @property {"sm" | "md" | "lg"} [size] - Size variant for the logo
 * @property {string} [href] - Link href (defaults to homepage)
 */
interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
  href?: string
}

/**
 * Logo component displaying the AttendMe brand
 *
 * @param {LogoProps} props - Component props
 * @returns {React.ReactElement} The logo as a link to the homepage
 *
 * @example
 * ```tsx
 * <Logo showText size="lg" />
 * ```
 */
export function Logo({
  className,
  showText = true,
  size = "md",
  href = "/"
}: LogoProps) {
  // Size variants for the logo
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10"
  }

  // Text size variants corresponding to logo sizes
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 transition-opacity hover:opacity-90",
        className
      )}
    >
      {/* Bubble logo icon */}
      <div
        className={cn(
          "bg-primary text-primary-foreground flex items-center justify-center rounded-full",
          sizeClasses[size]
        )}
      >
        {/* Simplified bubble icon representing a medical cross/plus */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-4/6"
        >
          <path
            d="M12 6v12M6 12h12"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Logo text */}
      {showText && (
        <span className={cn("font-bold tracking-tight", textSizeClasses[size])}>
          AttendMe
        </span>
      )}
    </Link>
  )
}
