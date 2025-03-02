/**
 * Library Management Custom Hook
 *
 * This hook provides functionality for managing library references in the application.
 * It handles loading, searching, filtering, and modifying user's saved references, abstracting
 * away database operations into a simple interface for components to use.
 *
 * Key features:
 * - Loading library references with pagination
 * - Adding references to the library
 * - Removing references from the library
 * - Searching and filtering by text, specialty, or date
 * - Sorting references by different criteria
 * - Managing loading and error states
 *
 * @module hooks/use-library
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { 
  getFilteredReferencesAction,
  deleteReferenceAction,
  createReferenceAction
} from "@/actions/db/references-actions"
import { Citation } from "@/types/chat-types"
import { LibraryFilterState, UpdateArticle } from "@/types/library-types"
import { SelectSpecialty } from "@/db/schema"
import { debounce } from "@/lib/utils"

/**
 * Return type for the useLibrary hook
 */
interface UseLibraryReturn {
  /**
   * Array of library references
   */
  references: any[]
  
  /**
   * Current loading state
   */
  isLoading: boolean
  
  /**
   * Error message if any
   */
  error: string | null
  
  /**
   * Filter state for the library
   */
  filters: LibraryFilterState
  
  /**
   * Function to set search query filter
   */
  setSearchQuery: (query: string) => void
  
  /**
   * Function to set specialty filter
   */
  setSpecialtyFilter: (specialtyId: string) => void
  
  /**
   * Function to set sort option
   */
  setSortOption: (sortBy: 'createdAt' | 'updatedAt' | 'title', order: 'asc' | 'desc') => void
  
  /**
   * Function to add a citation to the library
   */
  addCitationToLibrary: (citation: Citation) => Promise<boolean>
  
  /**
   * Function to add an article to the library
   */
  addArticleToLibrary: (article: UpdateArticle) => Promise<boolean>
  
  /**
   * Function to delete a reference from the library
   */
  deleteReference: (id: string) => Promise<boolean>
  
  /**
   * Function to refresh library data
   */
  refreshLibrary: () => Promise<void>
  
  /**
   * Total count of references (for pagination)
   */
  totalCount: number
  
  /**
   * Current page (for pagination)
   */
  currentPage: number
  
  /**
   * Function to set current page (for pagination)
   */
  setCurrentPage: (page: number) => void
  
  /**
   * Items per page (for pagination)
   */
  itemsPerPage: number
  
  /**
   * Function to set items per page (for pagination)
   */
  setItemsPerPage: (count: number) => void
}

/**
 * Hook for managing library references
 *
 * This hook provides functionality for loading, searching, and managing
 * the user's library of saved references.
 *
 * @param userId - ID of the current user
 * @param initialSpecialtyId - Optional initial specialty ID for filtering
 * @returns Object with references data and library management functions
 */
export function useLibrary(
  userId: string,
  initialSpecialtyId?: string | null
): UseLibraryReturn {
  // Library state
  const [references, setReferences] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(20)
  
  // Filter state
  const [filters, setFilters] = useState<LibraryFilterState>({
    searchQuery: "",
    specialty: initialSpecialtyId || "",
    sortBy: "date-newest",
    tags: []
  })
  
  // Toast notifications
  const { toast } = useToast()

  /**
   * Load references from the database with current filters
   *
   * This function fetches references based on the current filter state,
   * handling loading states and error conditions.
   */
  const loadReferences = useCallback(async () => {
    if (!userId) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      // Parse sort option
      const [sortField, sortOrder] = parseSortOption(filters.sortBy)
      
      // Build filter object
      const filterParams = {
        userId: userId,
        title: filters.searchQuery || undefined,
        specialtyId: filters.specialty || undefined
      }
      
      // Calculate pagination
      const offset = (currentPage - 1) * itemsPerPage
      
      // Fetch references
      const result = await getFilteredReferencesAction(
        filterParams,
        sortField as any,
        sortOrder as any,
        itemsPerPage,
        offset
      )
      
      if (result.isSuccess) {
        setReferences(result.data)
        // For a real implementation, we'd also fetch the total count
        // This is a simplification
        setTotalCount(result.data.length >= itemsPerPage ? itemsPerPage * 2 : result.data.length)
      } else {
        setError(result.message)
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load references"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: "Failed to load library references",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [userId, filters, currentPage, itemsPerPage, toast])
  
  // Load references when dependencies change
  useEffect(() => {
    loadReferences()
  }, [loadReferences])
  
  /**
   * Set search query with debounce
   */
  const setSearchQuery = useCallback(
    debounce((query: string) => {
      setFilters(prev => ({ ...prev, searchQuery: query }))
      setCurrentPage(1) // Reset to first page on new search
    }, 300),
    []
  )
  
  /**
   * Set specialty filter
   */
  const setSpecialtyFilter = useCallback((specialtyId: string) => {
    setFilters(prev => ({ ...prev, specialty: specialtyId }))
    setCurrentPage(1) // Reset to first page on filter change
  }, [])
  
  /**
   * Set sort option
   */
  const setSortOption = useCallback((
    sortBy: 'createdAt' | 'updatedAt' | 'title',
    order: 'asc' | 'desc'
  ) => {
    const sortOption = `${sortBy === 'updatedAt' ? 'date' : sortBy}-${order === 'desc' ? 'newest' : 'oldest'}`
    setFilters(prev => ({ ...prev, sortBy: sortOption as any }))
  }, [])
  
  /**
   * Add a citation to the library
   */
  const addCitationToLibrary = useCallback(async (citation: Citation): Promise<boolean> => {
    if (!userId) return false
    
    try {
      setIsLoading(true)
      
      // Create reference from citation
      const result = await createReferenceAction({
        userId,
        title: citation.title,
        content: `${citation.title}${citation.authors ? ` by ${citation.authors}` : ''}${citation.journal ? ` in ${citation.journal}` : ''}${citation.year ? ` (${citation.year})` : ''}`,
        specialtyId: undefined, // Citations often don't have specialty ID
        metadata: JSON.stringify({
          authors: citation.authors,
          journal: citation.journal,
          year: citation.year,
          doi: citation.doi,
          url: citation.url,
          sourceType: "citation",
          citationId: citation.id
        })
      })
      
      if (result.isSuccess) {
        // Add to local state
        setReferences(prev => [result.data, ...prev])
        
        toast({
          title: "Success",
          description: "Citation added to library"
        })
        
        return true
      } else {
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
      setIsLoading(false)
    }
  }, [userId, toast])
  
  /**
   * Add an article to the library
   */
  const addArticleToLibrary = useCallback(async (article: UpdateArticle): Promise<boolean> => {
    if (!userId) return false
    
    try {
      setIsLoading(true)
      
      // Create reference from article
      const result = await createReferenceAction({
        userId,
        title: article.title,
        content: article.abstract || `${article.title} by ${article.authors} in ${article.journal} (${article.year})`,
        specialtyId: article.specialtyId,
        metadata: JSON.stringify({
          authors: article.authors,
          journal: article.journal,
          year: article.year,
          doi: article.doi,
          url: article.url,
          sourceType: "article",
          articleId: article.id
        })
      })
      
      if (result.isSuccess) {
        // Add to local state
        setReferences(prev => [result.data, ...prev])
        
        toast({
          title: "Success",
          description: "Article added to library"
        })
        
        return true
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add article to library"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      return false
    } finally {
      setIsLoading(false)
    }
  }, [userId, toast])
  
  /**
   * Delete a reference from the library
   */
  const deleteReference = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false
    
    try {
      const result = await deleteReferenceAction(id, userId)
      
      if (result.isSuccess) {
        // Remove from local state
        setReferences(prev => prev.filter(ref => ref.id !== id))
        
        toast({
          title: "Success",
          description: "Reference removed from library"
        })
        
        return true
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete reference"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
      
      return false
    }
  }, [userId, toast])
  
  /**
   * Refresh library data
   */
  const refreshLibrary = useCallback(async () => {
    await loadReferences()
  }, [loadReferences])
  
  return {
    references,
    isLoading,
    error,
    filters,
    setSearchQuery,
    setSpecialtyFilter,
    setSortOption,
    addCitationToLibrary,
    addArticleToLibrary,
    deleteReference,
    refreshLibrary,
    totalCount,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
  }
}

/**
 * Parse sort option string into sort field and order
 *
 * @param sortOption - Sort option string (e.g., "date-newest")
 * @returns Tuple with sort field and order
 */
function parseSortOption(
  sortOption: string
): ['createdAt' | 'updatedAt' | 'title', 'asc' | 'desc'] {
  switch (sortOption) {
    case 'date-newest':
      return ['updatedAt', 'desc']
    case 'date-oldest':
      return ['updatedAt', 'asc']
    case 'title-asc':
      return ['title', 'asc']
    case 'title-desc':
      return ['title', 'desc']
    default:
      return ['updatedAt', 'desc'] // Default sort
  }
}

export default useLibrary 