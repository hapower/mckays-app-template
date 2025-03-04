/**
 * Citation Item Component
 *
 * This component displays a single citation item with its metadata and
 * provides options to add it to the user's library.
 *
 * Features:
 * - Displays citation title, authors, journal, and year
 * - Expandable view for more details
 * - Add to library functionality with proper loading states
 * - External link support for DOIs and URLs
 *
 * @module components/chat/citation-item
 */

"use client"

import { useState } from "react"
import { BookmarkPlus, Check, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { cn, formatDoiLink } from "@/lib/utils"
import { CitationBubbleProps } from "@/types/chat-types"

/**
 * CitationItem Component
 *
 * @param citation - The citation object with title, authors, journal, etc.
 * @param onAddToLibrary - Optional callback when adding citation to library
 * @param inLibrary - Whether this citation is already in the user's library
 */
export function CitationItem({
  citation,
  onAddToLibrary,
  inLibrary = false
}: CitationBubbleProps) {
  // Local state for expanded view and loading state
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isInLibrary, setIsInLibrary] = useState(inLibrary)

  /**
   * Handle adding citation to library
   */
  const handleAddToLibrary = async () => {
    if (!onAddToLibrary || isInLibrary) return

    setIsAdding(true)

    try {
      await onAddToLibrary(citation.id)
      setIsInLibrary(true)
    } catch (error) {
      console.error("Error adding citation to library:", error)
    } finally {
      setIsAdding(false)
    }
  }

  /**
   * Toggle expanded view
   */
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  /**
   * Generate a DOI link if available
   */
  const doiLink = citation.doi ? formatDoiLink(citation.doi) : undefined

  /**
   * Choose the URL to open when clicking the external link button
   * Prioritize DOI link over URL
   */
  const externalUrl = doiLink || citation.url

  return (
    <div
      className={cn(
        "citation-bubble flex flex-col overflow-hidden rounded-lg border transition-all duration-200",
        isExpanded ? "p-3" : "p-2"
      )}
    >
      <div
        className="flex cursor-pointer items-center justify-between"
        onClick={toggleExpanded}
      >
        <div className="mr-2 flex-1 font-medium">
          {citation.referenceNumber ? `[${citation.referenceNumber}] ` : ""}
          {citation.title}
        </div>

        <div className="flex shrink-0 items-center gap-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  disabled={isInLibrary || isAdding}
                  onClick={e => {
                    e.stopPropagation()
                    handleAddToLibrary()
                  }}
                >
                  {isInLibrary ? (
                    <Check className="text-primary size-4" />
                  ) : isAdding ? (
                    <span className="block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <BookmarkPlus className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {isInLibrary ? "In library" : "Add to library"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {externalUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={e => {
                      e.stopPropagation()
                      window.open(externalUrl, "_blank", "noopener,noreferrer")
                    }}
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Open source</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="text-muted-foreground mt-2 space-y-1 text-sm">
          {citation.authors && (
            <p>
              <span className="font-medium">Authors:</span> {citation.authors}
            </p>
          )}
          {citation.journal && (
            <p>
              <span className="font-medium">Journal:</span> {citation.journal}
            </p>
          )}
          {citation.year && (
            <p>
              <span className="font-medium">Year:</span> {citation.year}
            </p>
          )}
          {citation.doi && (
            <p>
              <span className="font-medium">DOI:</span>{" "}
              <a
                href={`https://doi.org/${citation.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
                onClick={e => e.stopPropagation()}
              >
                {citation.doi}
              </a>
            </p>
          )}
          {isInLibrary && (
            <p className="text-primary flex items-center font-medium italic">
              <Check className="mr-1 size-3" />
              Added to your library
            </p>
          )}
        </div>
      )}
    </div>
  )
}
