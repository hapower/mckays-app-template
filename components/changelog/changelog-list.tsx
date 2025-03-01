/**
 * Changelog List Component
 *
 * This component displays a list of changelog entries, representing
 * releases or significant updates. It provides filtering, sorting, and display
 * for the changelog entries.
 *
 * Key features:
 * - Filtering by version type (all, stable, beta)
 * - Sorting by date
 * - Loading states and error handling
 *
 * @module components/changelog/changelog-list
 */

"use client"

import { useState } from "react"
import { FileWarning, GitPullRequest, Loader2 } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ChangelogEntry } from "@/lib/changelog"
import { ChangelogItem } from "./changelog-item"

export interface ChangelogListProps {
  /**
   * The changelog entries to display
   */
  entries: ChangelogEntry[]
  /**
   * Loading state indicator
   */
  isLoading?: boolean
  /**
   * Error message if fetching failed
   */
  error?: string
  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * Filter types for the changelog list
 */
type FilterType = "all" | "stable" | "beta"

/**
 * A component that displays a list of changelog items with filtering
 *
 * @example
 * ```tsx
 * <ChangelogList entries={entries} isLoading={loading} />
 * ```
 */
export function ChangelogList({
  entries,
  isLoading = false,
  error,
  className
}: ChangelogListProps) {
  // State for selected filter
  const [filter, setFilter] = useState<FilterType>("all")

  // Filter entries based on selected filter
  const filteredEntries = entries.filter(entry => {
    if (filter === "all") return true
    if (filter === "stable") return !entry.isPrerelease
    if (filter === "beta") return entry.isPrerelease
    return true
  })

  // Sort entries by date (newest first)
  filteredEntries.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value as FilterType)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="text-muted-foreground mb-4 size-12 animate-spin" />
        <p className="text-lg font-medium">Loading changelog...</p>
        <p className="text-muted-foreground text-sm">Please wait</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileWarning className="text-destructive mb-4 size-12" />
        <h3 className="text-lg font-medium">Failed to load changelog</h3>
        <p className="text-muted-foreground mt-1 max-w-md text-sm">{error}</p>
      </div>
    )
  }

  // Show empty state
  if (filteredEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <GitPullRequest className="text-muted-foreground mb-4 size-12" />
        <h3 className="text-lg font-medium">No changelog entries found</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          {filter !== "all"
            ? `No ${filter} releases found. Try changing the filter.`
            : "Check back later for updates."}
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Filter controls */}
      <div className="mb-6 flex justify-end">
        <Select defaultValue={filter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Releases</SelectItem>
            <SelectItem value="stable">Stable Only</SelectItem>
            <SelectItem value="beta">Beta Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Changelog items */}
      <div className="space-y-6">
        {filteredEntries.map(entry => (
          <ChangelogItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
