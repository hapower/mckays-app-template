/**
 * Type definitions for library-related functionality
 *
 * These types define the structure for the library panel, search functionality,
 * and recent updates panel in the application.
 *
 * @module types/library-types
 */

import { Citation } from "./chat-types"
import { SelectSpecialty } from "@/db/schema"

/**
 * Interface for a library item (matching the libraryTable schema)
 */
export interface LibraryItem {
  id: string
  userId: string
  citationId: string
  notes?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
  citation?: Citation
}

/**
 * Interface for search parameters for the library
 */
export interface LibrarySearchParams {
  query?: string
  specialtyId?: string
  tags?: string[]
  fromDate?: Date
  toDate?: Date
  page?: number
  limit?: number
  sortBy?: SortOption
}

/**
 * Props for the library panel component
 */
export interface LibraryPanelProps {
  userId: string
}

/**
 * Interface for a recent medical update/article in the updates panel
 */
export interface UpdateArticle {
  id: string
  title: string
  authors: string
  journal: string
  year: string
  date: string
  abstract?: string
  doi?: string
  url?: string
  specialtyId?: string
  specialty?: SelectSpecialty
}

/**
 * Sorting options for library items
 */
export type SortOption =
  | "date-newest"
  | "date-oldest"
  | "title-asc"
  | "title-desc"
  | "relevance"

/**
 * State for library search and filtering
 */
export interface LibraryFilterState {
  searchQuery: string
  specialty?: string
  sortBy: SortOption
  tags: string[]
  dateRange?: {
    from: Date | null
    to: Date | null
  }
}

/**
 * Props for the reference item component
 */
export interface ReferenceItemProps {
  item: LibraryItem
  onDelete: (id: string) => void
}

/**
 * Props for the reference list component
 */
export interface ReferenceListProps {
  items: LibraryItem[]
  isLoading: boolean
  onDelete: (id: string) => void
}

/**
 * Props for the library search bar component
 */
export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onSubmit?: () => void
}

/**
 * Props for the update item component
 */
export interface UpdateItemProps {
  article: UpdateArticle
  onAddToLibrary?: () => void
}

/**
 * Props for the update list component
 */
export interface UpdateListProps {
  articles: UpdateArticle[]
  isLoading: boolean
  onAddToLibrary?: (articleId: string) => void
}
