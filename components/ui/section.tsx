/**
 * Section Component
 *
 * A component for grouping content into visually distinct sections with
 * consistent spacing and optional styling like background colors or borders.
 *
 * @module components/ui/section
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Props for the Section component
 *
 * @property {React.ReactNode} children - The content of the section
 * @property {string} [className] - Additional CSS classes
 * @property {string} [contentClassName] - Classes applied to the inner content div
 * @property {boolean} [background] - Whether to add a background color
 * @property {boolean} [border] - Whether to add a border
 * @property {string} [id] - Optional ID for the section element
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [spacing] - Amount of padding to apply
 * @property {React.ComponentPropsWithoutRef<"section">} [props] - Any other props to pass to the section element
 */
interface SectionProps extends React.ComponentPropsWithoutRef<"section"> {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  background?: boolean
  border?: boolean
  id?: string
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
}

/**
 * Section component for grouping related content
 *
 * @param {SectionProps} props - Component props
 * @returns {React.ReactElement} A section element with appropriate styling
 *
 * @example
 * ```tsx
 * <Section background border spacing="lg">
 *   <h2>Section Content</h2>
 *   <p>Some content here...</p>
 * </Section>
 * ```
 */
export function Section({
  children,
  className,
  contentClassName,
  background = false,
  border = false,
  id,
  spacing = "md",
  ...props
}: SectionProps) {
  // Map of spacing values to corresponding Tailwind padding classes
  const spacingClasses = {
    none: "py-0",
    sm: "py-4 md:py-6",
    md: "py-8 md:py-12",
    lg: "py-12 md:py-16",
    xl: "py-16 md:py-24"
  }

  return (
    <section
      id={id}
      className={cn(
        spacingClasses[spacing],
        background && "bg-muted",
        border && "border-y",
        className
      )}
      {...props}
    >
      <div className={cn("container", contentClassName)}>{children}</div>
    </section>
  )
}
