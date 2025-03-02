/**
 * Library Browser Component
 *
 * This client component provides the main interface for browsing and managing
 * reference items saved in the user's library. It integrates search, filtering,
 * pagination, and reference management functionality.
 *
 * Features:
 * - Search functionality for finding references
 * - Specialty filtering for organizing references
 * - Sort options for different views of the library
 * - Pagination for handling large libraries
 * - Reference deletion with confirmation
 * - Empty state handling and error feedback
 * - Loading states for asynchronous operations
 *
 * @module app/dashboard/_components/library-browser
 */

"use client"

import { useState, useEffect } from "react"
import { SearchBar } from "@/components/library/search-bar"
import { ReferenceList } from "@/components/library/reference-list"
import { LibrarySkeleton } from "@/components/library/library-skeleton"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination"
import { SlidersHorizontal, Trash2, AlertCircle } from "lucide-react"
import { SelectSpecialty } from "@/db/schema"
import { useToast } from "@/hooks/use-toast"
import { ReferenceItem } from "@/components/library/reference-item"
import { useLibrary } from "@/hooks/use-library"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
 * This component handles the display and management of a user's library,
 * including searching, filtering, and deleting references.
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
  // Use the library management hook
  const {
    references,
    isLoading,
    error,
    filters,
    setSearchQuery,
    setSpecialtyFilter,
    setSortOption,
    deleteReference,
    refreshLibrary,
    totalCount,
    currentPage,
    setCurrentPage,
    itemsPerPage
  } = useLibrary(userId, activeSpecialtyId || undefined)

  // Local state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [referenceToDelete, setReferenceToDelete] = useState<string | null>(
    null
  )
  const [deleteInProgress, setDeleteInProgress] = useState(false)

  // Toast notifications
  const { toast } = useToast()

  // Set initial specialty filter if provided
  useEffect(() => {
    if (activeSpecialtyId) {
      setSpecialtyFilter(activeSpecialtyId)
    }
  }, [activeSpecialtyId, setSpecialtyFilter])

  /**
   * Handle search input change
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  /**
   * Handle specialty filter change
   */
  const handleSpecialtyChange = (value: string) => {
    setSpecialtyFilter(value === "all" ? "" : value)
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

    setSortOption(field, direction)
  }

  /**
   * Handle deleting a reference
   */
  const handleDeleteReference = async (id: string) => {
    // Open confirmation dialog
    setReferenceToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Confirm deletion of a reference
   */
  const confirmDeleteReference = async () => {
    if (!referenceToDelete) return

    try {
      setDeleteInProgress(true)

      // Delete the reference
      const success = await deleteReference(referenceToDelete)

      if (success) {
        setIsDeleteDialogOpen(false)
        setReferenceToDelete(null)

        toast({
          title: "Reference deleted",
          description: "Reference has been removed from your library"
        })
      } else {
        throw new Error("Failed to delete reference")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete reference",
        variant: "destructive"
      })
    } finally {
      setDeleteInProgress(false)
    }
  }

  /**
   * Cancel deletion
   */
  const cancelDeleteReference = () => {
    setIsDeleteDialogOpen(false)
    setReferenceToDelete(null)
  }

  /**
   * Get sort option value from current filters
   */
  const getSortValue = (): string => {
    const [field, order] = parseSortOption(filters.sortBy)
    return `${field}-${order}`
  }

  /**
   * Parse sort option for display
   */
  function parseSortOption(
    sortOption: string
  ): ["updatedAt" | "createdAt" | "title", "asc" | "desc"] {
    switch (sortOption) {
      case "date-newest":
        return ["updatedAt", "desc"]
      case "date-oldest":
        return ["updatedAt", "asc"]
      case "title-asc":
        return ["title", "asc"]
      case "title-desc":
        return ["title", "desc"]
      default:
        return ["updatedAt", "desc"] // Default sort
    }
  }

  /**
   * Generate pagination items
   */
  const renderPagination = () => {
    if (totalCount <= itemsPerPage) return null

    const totalPages = Math.ceil(totalCount / itemsPerPage)

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage(currentPage - 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
            let pageNum = i + 1

            // Show ellipsis for many pages
            if (totalPages > 5 && currentPage > 3 && i === 0) {
              pageNum = 1
            } else if (totalPages > 5 && currentPage > 3 && i === 1) {
              return (
                <PaginationItem key="ellipsis-start">
                  <PaginationEllipsis />
                </PaginationItem>
              )
            } else if (totalPages > 5 && currentPage > 3) {
              pageNum = currentPage + i - 2
              if (pageNum > totalPages) return null
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={pageNum === currentPage}
                  onClick={() => setCurrentPage(pageNum)}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage(currentPage + 1)}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className={className}>
      {/* Search and filter controls */}
      <div className="mb-4 space-y-2">
        <SearchBar
          value={filters.searchQuery}
          onChange={handleSearchChange}
          placeholder="Search references..."
          isLoading={isLoading}
        />

        <div className="flex items-center gap-2">
          {/* Specialty filter */}
          {specialties.length > 0 && (
            <Select
              value={filters.specialty || "all"}
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
            value={getSortValue()}
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
      ) : error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          <ReferenceList
            references={references}
            onDelete={handleDeleteReference}
            error={undefined}
            emptyMessage={
              filters.searchQuery
                ? "No references match your search"
                : filters.specialty
                  ? "No references found for this specialty"
                  : "Your library is empty. References you save will appear here."
            }
          />

          {/* Pagination controls */}
          {renderPagination()}
        </>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reference</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this reference from your library?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeleteReference}
              disabled={deleteInProgress}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteReference}
              disabled={deleteInProgress}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInProgress ? (
                <span className="flex items-center">
                  <svg
                    className="mr-2 size-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
