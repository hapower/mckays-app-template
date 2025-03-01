/**
 * Specialties Selector Component
 *
 * This component allows users to browse and select medical specialties
 * which affects the AI responses by focusing on that specialty area.
 *
 * Features:
 * - Grouped display of medical and surgical specialties
 * - Loading states and error handling
 * - Search functionality to find specialties quickly
 * - Sends selected specialty to parent components for use in RAG and prompts
 *
 * @module app/dashboard/_components/specialties-selector
 */

"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { SpecialtyGrid } from "@/components/specialties/specialty-grid"
import { SpecialtySkeleton } from "@/components/specialties/specialty-skeleton"
import { SelectSpecialty } from "@/db/schema"
import { Search } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import {
  getSpecialtiesAction,
  getGroupedSpecialtiesAction
} from "@/actions/db/specialties-actions"

/**
 * Props for the SpecialtiesSelector component
 */
interface SpecialtiesSelectorProps {
  /**
   * The ID of the currently selected specialty
   */
  selectedSpecialtyId?: string | null

  /**
   * Callback function when a specialty is selected
   */
  onSelectSpecialty?: (specialty: SelectSpecialty) => void

  /**
   * Optional CSS class name
   */
  className?: string
}

/**
 * SpecialtiesSelector component
 *
 * @param selectedSpecialtyId - Currently selected specialty ID (if any)
 * @param onSelectSpecialty - Callback for when user selects a specialty
 * @param className - Optional additional CSS classes
 */
export function SpecialtiesSelector({
  selectedSpecialtyId,
  onSelectSpecialty,
  className
}: SpecialtiesSelectorProps) {
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
   * Handle specialty selection
   */
  const handleSelectSpecialty = (specialty: SelectSpecialty) => {
    if (onSelectSpecialty) {
      onSelectSpecialty(specialty)
    }
  }

  /**
   * Handle search input change
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  /**
   * Clear the selected specialty
   */
  const handleClearSelection = () => {
    if (onSelectSpecialty && selectedSpecialtyId) {
      // Find the currently selected specialty to pass to handler
      const current = specialties.find(s => s.id === selectedSpecialtyId)
      if (current) {
        onSelectSpecialty(current)
      }
    }
  }

  // Loading state
  if (isLoading) {
    return <SpecialtySkeleton count={8} grouped />
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Empty state - no specialties available
  if (specialties.length === 0) {
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
    <div className={className}>
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

        {/* Clear selection button - only shown when a specialty is selected */}
        {selectedSpecialtyId && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearSelection}
            className="w-full"
          >
            Clear Selection
          </Button>
        )}
      </div>

      {/* Show search results or grouped specialties */}
      {searchQuery ? (
        // Show search results as a flat list
        <SpecialtyGrid
          specialties={filteredSpecialties}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelectSpecialty={handleSelectSpecialty}
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
          onSelectSpecialty={handleSelectSpecialty}
          groupByType={true}
        />
      ) : (
        <SpecialtyGrid
          specialties={filteredSpecialties}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelectSpecialty={handleSelectSpecialty}
          groupByType={false}
        />
      )}
    </div>
  )
}
