/**
 * Page Title Component
 *
 * A component for displaying page titles with consistent styling across the application.
 * Optionally includes a description and supports different heading levels.
 *
 * @module components/ui/page-title
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Props for the PageTitle component
 *
 * @property {React.ReactNode} children - The title content
 * @property {string} [className] - Additional CSS classes for the title
 * @property {string} [descriptionClassName] - Additional CSS classes for the description
 * @property {React.ReactNode} [description] - Optional description text displayed below the title
 * @property {"h1" | "h2" | "h3" | "h4"} [as] - Heading element to use (default: "h1")
 */
interface PageTitleProps {
  children: React.ReactNode
  className?: string
  descriptionClassName?: string
  description?: React.ReactNode
  as?: "h1" | "h2" | "h3" | "h4"
}

/**
 * PageTitle component for displaying page titles with optional descriptions
 *
 * @param {PageTitleProps} props - Component props
 * @returns {React.ReactElement} A heading element with optional description
 *
 * @example
 * ```tsx
 * <PageTitle
 *   description="Manage your medical references and citations"
 *   as="h2"
 * >
 *   Medical Library
 * </PageTitle>
 * ```
 */
export function PageTitle({
  children,
  className,
  descriptionClassName,
  description,
  as: Component = "h1"
}: PageTitleProps) {
  return (
    <div className="mb-6">
      <Component
        className={cn(
          "font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl",
          className
        )}
      >
        {children}
      </Component>
      {description && (
        <p
          className={cn(
            "text-muted-foreground mt-3 text-lg",
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  )
}
