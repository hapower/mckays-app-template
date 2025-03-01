/**
 * Library Browser Component
 *
 * This client component provides the main interface for browsing and managing
 * reference items saved in the user's library. It integrates search, filtering,
 * pagination, and reference management functionality.
 *
 * Features:
 * - Search functionality for finding references
 * - Display of saved references with metadata
 * - Ability to delete references
 * - Loading states and error handling
 * - Empty state handling
 *
 * @module app/dashboard/_components/library-browser
 */

"use client"

import { useState, useEffect } from "react"
import { SearchBar } from "@/components/library/search-bar"
import { ReferenceList } from "@/components/library/reference-list"
import { LibrarySkeleton } from "@/components/library/library-skeleton"
import {
  deleteReferenceAction,
  getFilteredReferencesAction
} from "@/actions/db/references-actions"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SlidersHorizontal } from "lucide-react"
import { SelectSpecialty } from "@/db/schema"
import { useToast } from "@/components/ui/use-toast"
import { ReferenceItem } from "@/components/library/reference-item"

/**
 * Props for the LibraryBrowser component
 */
interface LibraryBrowserProps {
  /**
   * The user ID for fetching library references
   */
  userId: string

  /**
   * Optional ID of the currently active specialty filter
   */
  activeSpecialtyId?: string | null

  /**
   * List of available specialties for filtering
   */
  specialties?: SelectSpecialty[]

  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * LibraryBrowser component for browsing and managing library references
 *
 * @example
 * ```tsx
 * <LibraryBrowser userId={userId} specialties={specialties} />
 * ```
 */
export function LibraryBrowser({
  userId,
  activeSpecialtyId = null,
  specialties = [],
  className
}: LibraryBrowserProps) {
  // State for reference data and UI state
  const [references, setReferences] = useState<ReferenceItem["reference"][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>(
    activeSpecialtyId || "all"
  )
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(
    "updatedAt"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Toast notifications
  const { toast } = useToast()

  // Fetch references when filters change
  useEffect(() => {
    fetchReferences()
  }, [searchQuery, specialtyFilter, sortBy, sortOrder])

  /**
   * Fetch references based on current filters
   */
  const fetchReferences = async () => {
    if (!userId) {
      setError("User ID is required to fetch references")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Build filter object based on current filter state
      const filter: any = {
        userId: userId // Always include user ID for permission filtering
      }

      if (searchQuery) {
        filter.title = searchQuery
      }

      if (specialtyFilter && specialtyFilter !== "all") {
        filter.specialtyId = specialtyFilter
      }

      // Fetch references using the action
      const result = await getFilteredReferencesAction(
        filter,
        sortBy,
        sortOrder
      )

      if (result.isSuccess) {
        setReferences(result.data)
      } else {
        setError(result.message)
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred"
      setError(errorMessage)

      toast({
        title: "Error",
        description: "Failed to load references",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle deleting a reference
   */
  const handleDeleteReference = async (id: string) => {
    try {
      const result = await deleteReferenceAction(id, userId)

      if (result.isSuccess) {
        // Update local state to remove deleted reference
        setReferences(prev => prev.filter(ref => ref.id !== id))

        toast({
          title: "Reference deleted",
          description: "Reference has been removed from your library"
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete reference",
        variant: "destructive"
      })
    }
  }

  /**
   * Handle specialty filter change
   */
  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value)
  }

  /**
   * Handle sort options change
   */
  const handleSortChange = (value: string) => {
    // Parse the sort option (field-direction)
    const [field, direction] = value.split("-") as [
      "updatedAt" | "createdAt" | "title",
      "asc" | "desc"
    ]

    setSortBy(field)
    setSortOrder(direction)
  }

  // Generate sort option value from current sort state
  const sortValue = `${sortBy}-${sortOrder}`

  return (
    <div className={className}>
      {/* Search and filter controls */}
      <div className="mb-4 space-y-2">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search references..."
          isLoading={isLoading}
        />

        <div className="flex items-center gap-2">
          {/* Specialty filter */}
          {specialties.length > 0 && (
            <Select
              value={specialtyFilter}
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
            value={sortValue}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="ml-auto w-[180px]">
              <SlidersHorizontal className="mr-2 size-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt-desc">Recently updated</SelectItem>
              <SelectItem value="createdAt-desc">Recently added</SelectItem>
              <SelectItem value="createdAt-asc">Oldest first</SelectItem>
              <SelectItem value="title-asc">Title (A-Z)</SelectItem>
              <SelectItem value="title-desc">Title (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* References list with loading, error, and empty states */}
      {isLoading ? (
        <LibrarySkeleton count={3} />
      ) : (
        <ReferenceList
          references={references}
          onDelete={handleDeleteReference}
          error={error || undefined}
          emptyMessage={
            searchQuery
              ? "No references match your search"
              : specialtyFilter !== "all"
                ? "No references found for this specialty"
                : "Your library is empty. References you save will appear here."
          }
        />
      )}
    </div>
  )
}
