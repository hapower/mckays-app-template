/**
 * Update List Component
 *
 * This component displays a list of medical journal updates/articles with search, filter,
 * and sort capabilities. It manages the display of multiple update items, loading states,
 * and empty states.
 *
 * @module components/updates/update-list
 */

"use client"

import { useState } from "react"
import { FileText, SearchIcon, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SelectSpecialty } from "@/db/schema"
import { UpdateArticle } from "@/types/library-types"
import { UpdateItem } from "./update-item"
import { UpdatesSkeleton } from "./updates-skeleton"

export interface UpdateListProps {
  /**
   * Array of articles/updates to display
   */
  articles: UpdateArticle[]
  /**
   * Flag to indicate if articles are currently loading
   */
  isLoading?: boolean
  /**
   * Optional array of medical specialties for filtering
   */
  specialties?: SelectSpecialty[]
  /**
   * Callback function when an article is added to the library
   */
  onAddToLibrary?: (articleId: string) => void
  /**
   * Optional array of article IDs that are already in the user's library
   */
  libraryArticleIds?: string[]
  /**
   * Optional function to handle search queries
   */
  onSearch?: (query: string) => void
  /**
   * Optional function to handle specialty filter changes
   */
  onSpecialtyChange?: (specialtyId: string) => void
  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * Sort options for the updates list
 */
type SortOption = "recent" | "oldest" | "alphabetical"

/**
 * Component to display a list of medical journal updates/articles
 *
 * Features:
 * - Search functionality
 * - Specialty filtering
 * - Sorting options
 * - Loading states
 * - Empty state handling
 */
export function UpdateList({
  articles,
  isLoading = false,
  specialties = [],
  onAddToLibrary,
  libraryArticleIds = [],
  onSearch,
  onSpecialtyChange,
  className
}: UpdateListProps) {
  // Local state for search, filtering, and sorting
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all")
  const [localArticles, setLocalArticles] = useState<UpdateArticle[]>(articles)

  /**
   * Handle search input changes
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)

    if (onSearch) {
      // If external search handler is provided, use it
      onSearch(value)
      return
    }

    // Otherwise, perform local filtering
    if (!value.trim()) {
      setLocalArticles(articles)
      return
    }

    const filtered = articles.filter(
      article =>
        article.title.toLowerCase().includes(value.toLowerCase()) ||
        article.authors.toLowerCase().includes(value.toLowerCase()) ||
        article.journal.toLowerCase().includes(value.toLowerCase()) ||
        (article.abstract &&
          article.abstract.toLowerCase().includes(value.toLowerCase()))
    )

    setLocalArticles(filtered)
  }

  /**
   * Handle specialty filter changes
   */
  const handleSpecialtyChange = (value: string) => {
    setSelectedSpecialty(value)

    if (onSpecialtyChange) {
      // If external specialty filter handler is provided, use it
      onSpecialtyChange(value === "all" ? "" : value)
      return
    }

    // Otherwise, perform local filtering
    if (value === "all") {
      setLocalArticles(articles)
      return
    }

    const filtered = articles.filter(article => article.specialtyId === value)

    setLocalArticles(filtered)
  }

  /**
   * Handle sort option changes
   */
  const handleSortChange = (value: SortOption) => {
    setSortBy(value)

    const sorted = [
      ...(onSearch || onSpecialtyChange ? articles : localArticles)
    ]

    switch (value) {
      case "recent":
        sorted.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(`${a.year}-01-01`)
          const dateB = b.date ? new Date(b.date) : new Date(`${b.year}-01-01`)
          return dateB.getTime() - dateA.getTime()
        })
        break
      case "oldest":
        sorted.sort((a, b) => {
          const dateA = a.date ? new Date(a.date) : new Date(`${a.year}-01-01`)
          const dateB = b.date ? new Date(b.date) : new Date(`${b.year}-01-01`)
          return dateA.getTime() - dateB.getTime()
        })
        break
      case "alphabetical":
        sorted.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setLocalArticles(sorted)
  }

  /**
   * Determine which articles to display based on server/client filtering
   */
  const displayArticles =
    onSearch || onSpecialtyChange ? articles : localArticles

  /**
   * Handle search form submission
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  // Display loading skeleton when loading
  if (isLoading) {
    return <UpdatesSkeleton count={5} />
  }

  return (
    <div className={className}>
      {/* Search and filter controls */}
      <div className="mb-4 space-y-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className="flex-1"
          />

          <Button type="submit" variant="outline" size="icon">
            <SearchIcon className="size-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-2">
          {/* Specialty filter */}
          {specialties.length > 0 && (
            <Select
              value={selectedSpecialty}
              onValueChange={handleSpecialtyChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
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
            value={sortBy}
            onValueChange={value => handleSortChange(value as SortOption)}
          >
            <SelectTrigger className="ml-auto w-[140px]">
              <SlidersHorizontal className="mr-2 size-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Articles list */}
      {displayArticles.length > 0 ? (
        <div className="space-y-4">
          {displayArticles.map(article => (
            <UpdateItem
              key={article.id}
              article={article}
              onAddToLibrary={onAddToLibrary}
              inLibrary={libraryArticleIds.includes(article.id)}
            />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="text-muted-foreground mb-4 size-12" />
          <h3 className="text-lg font-medium">No articles found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            {searchQuery
              ? "Try a different search term or filter"
              : "Recent medical updates will appear here"}
          </p>
        </div>
      )}
    </div>
  )
}
