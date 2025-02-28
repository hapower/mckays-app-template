/**
 * Updates Skeleton Component
 *
 * This component provides a loading state visual for the updates panel while
 * content is being fetched. It displays placeholder cards with shimmer animations
 * that mimic the structure of the actual update items.
 *
 * @module components/updates/updates-skeleton
 */

"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export interface UpdatesSkeletonProps {
  /**
   * Number of skeleton items to display
   */
  count?: number
  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * Component to display a loading skeleton for the updates panel
 *
 * Features:
 * - Configurable number of skeleton items
 * - Structure matches the real update items for a smoother transition
 * - Animated shimmer effect with varying widths for realistic appearance
 */
export function UpdatesSkeleton({
  count = 3,
  className
}: UpdatesSkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and filter skeletons */}
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="size-10 rounded-md" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 w-[180px] rounded-md" />
          <Skeleton className="ml-auto h-10 w-[140px] rounded-md" />
        </div>
      </div>

      {/* Article skeleton items */}
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-2">
            {/* Title with varied widths */}
            <Skeleton
              className={cn(
                "h-6 w-full rounded-md",
                index % 2 === 0 ? "w-full" : "w-[85%]"
              )}
            />
          </CardHeader>

          <CardContent className="pb-2">
            <div className="space-y-2">
              {/* Authors */}
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton
                  className={cn(
                    "h-4 rounded-md",
                    index % 3 === 0
                      ? "w-[70%]"
                      : index % 3 === 1
                        ? "w-[60%]"
                        : "w-[65%]"
                  )}
                />
              </div>

              {/* Journal */}
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton
                  className={cn(
                    "h-4 rounded-md",
                    index % 2 === 0 ? "w-[50%]" : "w-[45%]"
                  )}
                />
              </div>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-md" />
              </div>

              {/* Specialty tag - only show on some items */}
              {index % 3 === 0 && (
                <div className="mt-1">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-0">
            <Skeleton className="h-8 w-16 rounded-md" />

            <div className="flex items-center gap-1">
              <Skeleton className="size-8 rounded-md" />
              {/* External link - only show on some items */}
              {index % 2 === 0 && <Skeleton className="size-8 rounded-md" />}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
