/**
 * Citation Library Management Hook
 * 
 * This custom hook provides functionality for managing citations in the user's library.
 * It allows components to check if citations are in the library, add citations to the 
 * library, and remove citations from the library with optimistic updates for a smooth UX.
 * 
 * Key features:
 * - Check if a citation is in the user's library
 * - Add citations to the library with optimistic updates
 * - Remove citations from the library
 * - Loading and error state management
 * - Batched operations for adding multiple citations
 * 
 * @module hooks/use-citation-library
 */

"use client"

import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Citation } from "@/types/chat-types"
import { addCitationToLibraryAction } from "@/actions/reference-extraction-actions"
import { deleteReferenceAction, getFilteredReferencesAction } from "@/actions/db/references-actions"

/**
 * Interface for the return value of the useCitationLibrary hook
 */
interface UseCitationLibraryResult {
  /**
   * Check if a citation is in the library
   */
  isInLibrary: (citationId: string) => boolean
  
  /**
   * Add a citation to the library
   */
  addToLibrary: (citation: Citation) => Promise<boolean>
  
  /**
   * Remove a citation from the library
   */
  removeFromLibrary: (citationId: string) => Promise<boolean>
  
  /**
   * Add multiple citations to the library
   */
  addMultipleToLibrary: (citations: Citation[]) => Promise<number>
  
  /**
   * Map of citation IDs to their library status
   */
  libraryStatusMap: Record<string, boolean>
  
  /**
   * Whether a citation is currently being added to the library
   */
  isAddingMap: Record<string, boolean>
  
  /**
   * Whether the citation library is currently loading
   */
  isLoading: boolean
  
  /**
   * Any error that occurred while interacting with the library
   */
  error: string | null
  
  /**
   * Refresh the library status
   */
  refreshLibraryStatus: () => Promise<void>
}

/**
 * Custom hook for managing citations in the library
 * 
 * This hook provides functionality for checking if citations are in the library,
 * adding citations to the library, and removing citations from the library.
 * 
 * @param userId - The ID of the current user
 * @param initialCitations - Optional array of initial citations to check
 * @returns Object with functions and state for managing citations in the library
 */
export function useCitationLibrary(
  userId: string,
  initialCitations: Citation[] = []
): UseCitationLibraryResult {
  // State for tracking library status, loading state, and errors
  const [libraryStatusMap, setLibraryStatusMap] = useState<Record<string, boolean>>({})
  const [isAddingMap, setIsAddingMap] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  // Used for notifications
  const { toast } = useToast()

  /**
   * Initialize library status map with initial citations
   */
  useEffect(() => {
    if (initialCitations.length > 0 && userId) {
      refreshLibraryStatus()
    }
  }, [userId])
  
  /**
   * Check the library status for a set of citations
   */
  const refreshLibraryStatus = useCallback(async () => {
    if (!userId || initialCitations.length === 0) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Get all library references
      const result = await getFilteredReferencesAction(
        { userId },
        'updatedAt',
        'desc',
        100, // Get a reasonable number of references
        0
      )
      
      if (result.isSuccess) {
        // Create a map to easily check if a citation is in the library
        const newStatusMap: Record<string, boolean> = {}
        
        // Check each citation
        initialCitations.forEach(citation => {
          // Check if any library item's metadata contains this citation ID
          const isInLibrary = result.data.some(item => {
            try {
              const metadata = item.metadata ? JSON.parse(item.metadata as string) : {}
              return metadata.citationId === citation.id
            } catch {
              return false
            }
          })
          
          newStatusMap[citation.id] = isInLibrary
        })
        
        setLibraryStatusMap(newStatusMap)
      } else {
        setError(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check library status"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [userId, initialCitations])

  /**
   * Check if a citation is in the library
   */
  const isInLibrary = useCallback((citationId: string): boolean => {
    return libraryStatusMap[citationId] || false
  }, [libraryStatusMap])

  /**
   * Add a citation to the library
   */
  const addToLibrary = useCallback(async (citation: Citation): Promise<boolean> => {
    if (!userId) return false
    if (libraryStatusMap[citation.id]) return true // Already in library
    
    // Mark as adding
    setIsAddingMap(prev => ({ ...prev, [citation.id]: true }))
    
    try {
      // Optimistic update
      setLibraryStatusMap(prev => ({ ...prev, [citation.id]: true }))
      
      // Add to library via server action
      const result = await addCitationToLibraryAction(citation.id, userId)
      
      if (result.isSuccess) {
        toast({
          title: "Citation added",
          description: "The citation has been added to your library"
        })
        return true
      } else {
        // Revert optimistic update on failure
        setLibraryStatusMap(prev => ({ ...prev, [citation.id]: false }))
        throw new Error(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add citation to library"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      return false
    } finally {
      setIsAddingMap(prev => ({ ...prev, [citation.id]: false }))
    }
  }, [userId, libraryStatusMap, toast])

  /**
   * Remove a citation from the library
   */
  const removeFromLibrary = useCallback(async (citationId: string): Promise<boolean> => {
    if (!userId) return false
    if (!libraryStatusMap[citationId]) return true // Not in library
    
    try {
      // We need to first find the library item ID for this citation
      const result = await getFilteredReferencesAction(
        { userId },
        'updatedAt',
        'desc',
        100,
        0
      )
      
      if (!result.isSuccess) {
        throw new Error(result.message)
      }
      
      // Find the library item with this citation ID
      const libraryItem = result.data.find(item => {
        try {
          const metadata = item.metadata ? JSON.parse(item.metadata as string) : {}
          return metadata.citationId === citationId
        } catch {
          return false
        }
      })
      
      if (!libraryItem) {
        throw new Error("Citation not found in library")
      }
      
      // Optimistic update
      setLibraryStatusMap(prev => ({ ...prev, [citationId]: false }))
      
      // Delete from library
      const deleteResult = await deleteReferenceAction(libraryItem.id, userId)
      
      if (deleteResult.isSuccess) {
        toast({
          title: "Citation removed",
          description: "The citation has been removed from your library"
        })
        return true
      } else {
        // Revert optimistic update
        setLibraryStatusMap(prev => ({ ...prev, [citationId]: true }))
        throw new Error(deleteResult.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove citation from library"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      return false
    }
  }, [userId, libraryStatusMap, toast])

  /**
   * Add multiple citations to the library
   * Returns the number of successfully added citations
   */
  const addMultipleToLibrary = useCallback(async (citations: Citation[]): Promise<number> => {
    if (!userId || citations.length === 0) return 0
    
    let successCount = 0
    setIsLoading(true)
    
    try {
      // Process citations in sequence to avoid overwhelming the server
      for (const citation of citations) {
        if (!libraryStatusMap[citation.id]) {
          const success = await addToLibrary(citation)
          if (success) successCount++
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Citations added",
          description: `${successCount} citation${successCount !== 1 ? 's' : ''} added to your library`
        })
      }
      
      return successCount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add citations to library"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      return successCount
    } finally {
      setIsLoading(false)
    }
  }, [userId, libraryStatusMap, addToLibrary, toast])

  return {
    isInLibrary,
    addToLibrary,
    removeFromLibrary,
    addMultipleToLibrary,
    libraryStatusMap,
    isAddingMap,
    isLoading,
    error,
    refreshLibraryStatus
  }
}

export default useCitationLibrary 