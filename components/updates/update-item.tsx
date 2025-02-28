/**
 * Update Item Component
 *
 * This component displays a single medical journal update/article in the updates panel.
 * It shows the article metadata (title, authors, journal, year) and provides
 * interactivity like expandable view for abstracts and an option to add to library.
 *
 * @module components/updates/update-item
 */

"use client"

import { useState } from "react"
import {
  BookmarkPlus,
  Calendar,
  ExternalLink,
  FileText,
  Users
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn, formatDate, truncateText } from "@/lib/utils"
import { UpdateArticle } from "@/types/library-types"

export interface UpdateItemProps {
  /**
   * The medical journal article/update to display
   */
  article: UpdateArticle
  /**
   * Optional callback for adding the article to the user's library
   */
  onAddToLibrary?: (articleId: string) => void
  /**
   * Optional flag to indicate if the article is already in the user's library
   */
  inLibrary?: boolean
  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * Component to display a single medical journal update/article
 *
 * Features:
 * - Expandable view to show abstract
 * - External link to original article when available
 * - Add to library functionality
 * - Clean metadata display with icons
 */
export function UpdateItem({
  article,
  onAddToLibrary,
  inLibrary = false,
  className
}: UpdateItemProps) {
  // Local state for expanded view and loading state
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  /**
   * Handle adding the article to the user's library
   */
  const handleAddToLibrary = async () => {
    if (!onAddToLibrary || inLibrary) return

    setIsAdding(true)
    try {
      await onAddToLibrary(article.id)
    } catch (error) {
      console.error("Error adding article to library:", error)
    } finally {
      setIsAdding(false)
    }
  }

  /**
   * Format article date for display
   */
  const displayDate = article.date ? formatDate(article.date) : article.year

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        isExpanded && "shadow-md",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className="line-clamp-2 cursor-pointer text-lg font-bold"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {article.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        {/* Article metadata with icons */}
        <div className="text-muted-foreground flex flex-col space-y-1 text-sm">
          {article.authors && (
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span>{article.authors}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <FileText className="size-4" />
            <span>{article.journal}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>{displayDate}</span>
          </div>

          {article.specialty && (
            <div className="mt-1">
              <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                {article.specialty.name}
              </span>
            </div>
          )}
        </div>

        {/* Abstract - only visible when expanded */}
        {isExpanded && article.abstract && (
          <div className="mt-4">
            <h4 className="mb-1 text-sm font-medium">Abstract</h4>
            <p className="text-muted-foreground whitespace-pre-wrap text-sm">
              {article.abstract}
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>

        <div className="flex items-center gap-1">
          {/* Add to library button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={inLibrary || isAdding}
                  onClick={handleAddToLibrary}
                >
                  {inLibrary ? (
                    <BookmarkPlus className="text-primary size-4" />
                  ) : isAdding ? (
                    <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <BookmarkPlus className="size-4" />
                  )}
                  <span className="sr-only">
                    {inLibrary ? "In library" : "Add to library"}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {inLibrary ? "In library" : "Add to library"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* External link button - only if URL is available */}
          {article.url && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      window.open(article.url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <ExternalLink className="size-4" />
                    <span className="sr-only">View source</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">View source</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
