/**
 * Specialty Skeleton Component
 *
 * This component provides a loading skeleton UI for the specialty selector while
 * specialty data is being fetched. It mimics the layout and structure of the
 * SpecialtyGrid to create a smooth loading experience.
 *
 * Features:
 * - Placeholder animations for loading state
 * - Matches the layout of the specialty grid
 * - Grouped sections to mirror the medical/surgical division
 *
 * @module components/specialties/specialty-skeleton
 */

"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface SpecialtySkeletonProps {
  count?: number
  className?: string
  grouped?: boolean
}

export function SpecialtySkeleton({
  count = 8,
  className,
  grouped = true
}: SpecialtySkeletonProps) {
  // Split count between medical and surgical if grouped
  const medicalCount = grouped ? Math.ceil(count * 0.6) : 0 // 60% medical
  const surgicalCount = grouped ? count - medicalCount : 0 // 40% surgical

  // Function to render a single skeleton card
  const renderSkeletonCard = (index: number) => (
    <div key={index} className="border-border rounded-xl border p-4">
      {/* Title skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        {/* Random width for variety */}
        <Skeleton
          className={cn(
            "size-5 rounded-full",
            Math.random() > 0.7 ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Description skeleton - random heights for variety */}
      {Math.random() > 0.5 && (
        <div className="mt-2 space-y-1">
          <Skeleton className="h-3 w-full" />
          {Math.random() > 0.5 && <Skeleton className="h-3 w-4/5" />}
        </div>
      )}
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {grouped ? (
        <>
          {/* Medical specialties skeleton section */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {Array.from({ length: medicalCount }).map((_, index) =>
                renderSkeletonCard(index)
              )}
            </div>
          </div>

          {/* Surgical specialties skeleton section */}
          <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
              {Array.from({ length: surgicalCount }).map((_, index) =>
                renderSkeletonCard(index + medicalCount)
              )}
            </div>
          </div>
        </>
      ) : (
        /* All specialties in a single grid */
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: count }).map((_, index) =>
            renderSkeletonCard(index)
          )}
        </div>
      )}
    </div>
  )
}
