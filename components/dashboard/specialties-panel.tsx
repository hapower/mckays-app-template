/**
 * Specialties Panel Component
 *
 * This component provides a container for the specialties selector in the dashboard.
 * It uses the Card component for consistent styling with other dashboard panels
 * and provides a structured layout for displaying and selecting medical specialties.
 *
 * The panel has a fixed header with title and optional action buttons,
 * a scrollable content area, and an optional footer section.
 *
 * @module components/dashboard/specialties-panel
 */

"use client"

import { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Props for the SpecialtiesPanel component
 */
interface SpecialtiesPanelProps {
  /**
   * Title displayed in the panel header
   */
  title?: string

  /**
   * Content for the main area
   * This should typically be the specialties selector component
   */
  children: ReactNode

  /**
   * Content for the action area at the bottom
   * This can include filters or additional controls
   */
  footer?: ReactNode

  /**
   * Additional CSS class names to apply to the component
   */
  className?: string

  /**
   * Whether the panel is in a loading state
   */
  isLoading?: boolean
}

/**
 * Specialties Panel component that provides the layout structure for the specialties selector
 *
 * @example
 * ```tsx
 * <SpecialtiesPanel
 *   title="Medical Specialties"
 *   footer={<SpecialtyFilter onFilterChange={handleFilterChange} />}
 * >
 *   <SpecialtiesSelector specialties={specialties} />
 * </SpecialtiesPanel>
 * ```
 */
export function SpecialtiesPanel({
  title = "Specialties",
  children,
  footer,
  className,
  isLoading = false
}: SpecialtiesPanelProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col overflow-hidden",
        isLoading && "opacity-80",
        className
      )}
    >
      {/* Panel header with title */}
      <CardHeader className="px-4 py-3 shadow-sm">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>

      {/* Main content area for specialties */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="chat-scrollbar h-full overflow-y-auto p-4">
          {children}
        </div>
      </CardContent>

      {/* Footer area for filters or additional controls */}
      {footer && (
        <CardFooter className="bg-card border-t p-4">{footer}</CardFooter>
      )}
    </Card>
  )
}
