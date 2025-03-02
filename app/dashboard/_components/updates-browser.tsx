/**
 * Updates Browser Component
 *
 * This client component provides the UI for browsing, searching, and filtering
 * recent medical journal updates in the dashboard. It uses the useUpdates hook to
 * manage state and data fetching, and renders updates with appropriate loading,
 * error and empty states.
 *
 * Key features:
 * - Search functionality for finding updates by title, authors, etc.
 * - Specialty filtering to focus on specific medical domains
 * - Sort options for different views of the updates
 * - Displaying update articles with metadata
 * - Option to add updates to the user's library
 *
 * @module app/dashboard/_components/updates-browser
 */

"use client"

import { useEffect, useState } from "react"
import { UpdateList } from "@/components/updates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { useUpdates } from "@/hooks/use-updates"
import { useToast } from "@/hooks/use-toast"
import { UpdatesSkeleton } from "@/components/updates"
import { SelectSpecialty } from "@/db/schema"

export interface UpdatesBrowserProps {
  /**
   * The user ID for fetching and managing updates
   */
  userId: string

  /**
   * Optional list of medical specialties for filtering
   */
  specialties?: SelectSpecialty[]

  /**
   * Optional class name for styling
   */
  className?: string
}

/**
 * Updates Browser Component
 *
 * Provides a browsing interface for recent medical updates with
 * search, filter, and sort functionality.
 *
 * @param props - Component props
 * @returns A React component
 */
export function UpdatesBrowser({
  userId,
  specialties = [],
  className
}: UpdatesBrowserProps) {
  // Get updates functionality from custom hook
  const {
    updates,
    isLoading,
    error,
    filters,
    setSearchQuery,
    setSpecialtyFilter,
    setSortOption,
    refreshUpdates,
    addToLibrary,
    inLibraryMap
  } = useUpdates(userId)

  // Local state for refresh button
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  /**
   * Handle manual refresh of updates
   */
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUpdates()
      toast({
        title: "Updates Refreshed",
        description: "Latest medical updates have been loaded"
      })
    } catch (err) {
      // Error is already handled in the hook
    } finally {
      setIsRefreshing(false)
    }
  }

  /**
   * Handle change in search query
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  /**
   * Handle change in specialty filter
   */
  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value === "all" ? "" : value)
  }

  /**
   * Handle change in sort option
   */
  const handleSortChange = (value: string) => {
    // Parse the sort option (field-direction)
    const [field, direction] = value.split("-") as [
      "date" | "title" | "journal",
      "asc" | "desc"
    ]

    setSortOption(field, direction)
  }

  /**
   * Handle adding an article to the library
   */
  const handleAddToLibrary = async (articleId: string) => {
    if (inLibraryMap[articleId]) {
      // Already in library
      toast({
        title: "Already in Library",
        description: "This article is already in your library"
      })
      return
    }

    await addToLibrary(articleId)
  }

  /**
   * Render content based on loading and error states
   */
  const renderContent = () => {
    if (isLoading) {
      return <UpdatesSkeleton count={4} />
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )
    }

    return (
      <UpdateList
        articles={updates}
        isLoading={isLoading}
        onAddToLibrary={handleAddToLibrary}
        libraryArticleIds={Object.entries(inLibraryMap)
          .filter(([_, value]) => value)
          .map(([key]) => key)}
        onSearch={handleSearchChange}
        onSpecialtyChange={handleSpecialtyChange}
        specialties={specialties}
      />
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Recent Updates</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          className="h-8 px-2"
        >
          <RefreshCw
            className={`mr-1 size-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="p-4">
        {/* Filters */}
        <div className="mb-4 space-y-2">
          {/* Search input is now handled in the UpdateList component */}

          <div className="flex flex-wrap gap-2">
            {/* Specialty filter */}
            {specialties.length > 0 && (
              <Select
                value={filters.specialtyId || "all"}
                onValueChange={handleSpecialtyChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All specialties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All specialties</SelectItem>
                  {specialties.map(specialty => (
                    <SelectItem key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort options */}
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Most recent</SelectItem>
                <SelectItem value="date-asc">Oldest first</SelectItem>
                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                <SelectItem value="journal-asc">Journal (A-Z)</SelectItem>
                <SelectItem value="journal-desc">Journal (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Updates content */}
        {renderContent()}
      </CardContent>
    </Card>
  )
}

export default UpdatesBrowser
