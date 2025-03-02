/**
 * Specialties Selector Component
 *
 * This component allows users to browse and select medical specialties
 * which affects the AI responses by focusing on that specialty area.
 * It integrates with the useSpecialtySelection hook to handle specialty
 * selection state and updates to the AI chat context.
 *
 * Features:
 * - Grouped display of medical and surgical specialties
 * - Loading states and error handling
 * - Search functionality to find specialties quickly
 * - Sends selected specialty to parent components for use in RAG and prompts
 * - Visual indication of the currently selected specialty
 * - Ability to clear selected specialty
 *
 * @module app/dashboard/_components/specialties-selector
 */

"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { SpecialtyGrid } from "@/components/specialties/specialty-grid"
import { SpecialtySkeleton } from "@/components/specialties/specialty-skeleton"
import { SelectSpecialty } from "@/db/schema"
import { Search, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  getSpecialtiesAction,
  getGroupedSpecialtiesAction
} from "@/actions/db/specialties-actions"
import { useSpecialtySelection } from "@/hooks/use-specialty-selection"
import { Badge } from "@/components/ui/badge"

/**
 * SpecialtiesSelector component
 *
 * This component displays a grid of medical specialties that users can select
 * to focus the AI on a specific medical domain. It integrates with the
 * useSpecialtySelection hook to manage specialty selection state and update
 * the AI chat context when a specialty is selected.
 */
export function SpecialtiesSelector() {
  // Get specialty selection functionality from custom hook
  const {
    selectedSpecialtyId,
    selectedSpecialtyName,
    isLoading: isSelectionLoading,
    error: selectionError,
    selectSpecialty: handleSelectSpecialty,
    clearSpecialty: handleClearSpecialty
  } = useSpecialtySelection()

  // State for specialties data and UI state
  const [specialties, setSpecialties] = useState<SelectSpecialty[]>([])
  const [groupedSpecialties, setGroupedSpecialties] = useState<{
    medical: SelectSpecialty[]
    surgical: SelectSpecialty[]
  }>({ medical: [], surgical: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredSpecialties, setFilteredSpecialties] = useState<
    SelectSpecialty[]
  >([])

  // Use toast for notifications
  const { toast } = useToast()

  // Fetch specialties on component mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // First try to get grouped specialties for better organization
        const groupedResult = await getGroupedSpecialtiesAction()

        if (groupedResult.isSuccess && groupedResult.data) {
          setGroupedSpecialties(groupedResult.data)
          setSpecialties([
            ...groupedResult.data.medical,
            ...groupedResult.data.surgical
          ])
          setFilteredSpecialties([
            ...groupedResult.data.medical,
            ...groupedResult.data.surgical
          ])
        } else {
          // Fall back to regular specialty list if grouping fails
          const result = await getSpecialtiesAction()

          if (result.isSuccess && result.data) {
            setSpecialties(result.data)
            setFilteredSpecialties(result.data)
          } else {
            throw new Error(result.message || "Failed to load specialties")
          }
        }
      } catch (err) {
        console.error("Error fetching specialties:", err)
        setError("Failed to load specialties. Please try again.")

        toast({
          title: "Error",
          description: "Failed to load medical specialties",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpecialties()
  }, [toast])

  // Filter specialties when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Reset to full list when search is empty
      setFilteredSpecialties(specialties)
      return
    }

    const lowerQuery = searchQuery.toLowerCase()
    const filtered = specialties.filter(
      specialty =>
        specialty.name.toLowerCase().includes(lowerQuery) ||
        (specialty.description &&
          specialty.description.toLowerCase().includes(lowerQuery))
    )

    setFilteredSpecialties(filtered)
  }, [searchQuery, specialties])

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  /**
   * Wrapper for selecting a specialty that handles loading state
   */
  const onSelectSpecialty = async (specialty: SelectSpecialty) => {
    // If the specialty is already selected, clear it
    if (selectedSpecialtyId === specialty.id) {
      await handleClearSpecialty()
      return
    }

    // Otherwise, select the new specialty
    await handleSelectSpecialty(specialty)
  }

  // Show a combined loading state
  const isLoadingState = isLoading || isSelectionLoading

  // Combined error handling
  const combinedError = error || selectionError

  // Loading state
  if (isLoading && !selectionError) {
    return <SpecialtySkeleton count={8} grouped />
  }

  // Error state
  if (combinedError && !isLoadingState) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{combinedError}</AlertDescription>
      </Alert>
    )
  }

  // Empty state - no specialties available
  if (specialties.length === 0 && !isLoadingState) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium">No specialties available</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Please contact support or try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected specialty display */}
      {selectedSpecialtyId && selectedSpecialtyName && (
        <div className="bg-primary/10 flex items-center justify-between rounded-md p-3">
          <div className="flex items-center">
            <Badge variant="outline" className="bg-primary/20 mr-2">
              Active Specialty
            </Badge>
            <span className="text-primary font-medium">
              {selectedSpecialtyName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSpecialty}
            disabled={isSelectionLoading}
            className="text-primary hover:bg-primary/20 hover:text-primary"
          >
            <X className="mr-1 size-4" />
            Clear
          </Button>
        </div>
      )}

      <div className="mb-4 space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            type="search"
            placeholder="Search specialties..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Show search results or grouped specialties */}
      {searchQuery ? (
        // Show search results as a flat list
        <SpecialtyGrid
          specialties={filteredSpecialties}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelectSpecialty={onSelectSpecialty}
          groupByType={false}
        />
      ) : // Show grouped specialties if groups are available, otherwise fall back to ungrouped
      groupedSpecialties.medical.length > 0 ||
        groupedSpecialties.surgical.length > 0 ? (
        <SpecialtyGrid
          specialties={[
            ...groupedSpecialties.medical,
            ...groupedSpecialties.surgical
          ]}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelectSpecialty={onSelectSpecialty}
          groupByType={true}
        />
      ) : (
        <SpecialtyGrid
          specialties={filteredSpecialties}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelectSpecialty={onSelectSpecialty}
          groupByType={false}
        />
      )}

      {/* Loading overlay */}
      {isSelectionLoading && (
        <div className="bg-background/60 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="mt-2 text-sm">Updating specialty...</p>
          </div>
        </div>
      )}
    </div>
  )
}
