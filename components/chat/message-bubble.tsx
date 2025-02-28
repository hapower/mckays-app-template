/**
 * Message Bubble Component
 *
 * This component displays a message in a chat interface with its associated citations.
 * It handles both user and assistant (AI) messages with appropriate styling and layout.
 *
 * Features:
 * - Different styling for user and assistant messages
 * - Citation highlighting and interactive references in message content
 * - Expandable citation details
 * - Copy message functionality
 * - Add to library functionality for citations
 *
 * @module components/chat/message-bubble
 */

"use client"

import { useState } from "react"
import { BookmarkPlus, Check, Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import { cn, formatDateTime, truncateText } from "@/lib/utils"
import { ChatMessage, Citation, MessageBubbleProps } from "@/types/chat-types"

/**
 * MessageBubble Component
 *
 * @param message - The chat message object containing content, role, and timestamps
 * @param citations - Optional array of citations associated with the message
 * @param onAddToLibrary - Optional callback when adding a citation to the library
 */
export function MessageBubble({
  message,
  citations = [],
  onAddToLibrary
}: MessageBubbleProps) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null)

  // Determine if message is from the user or the assistant for styling purposes
  const isUserMessage = message.role === "user"

  /**
   * Handle adding a citation to library
   */
  const handleAddToLibrary = (citationId: string) => {
    if (onAddToLibrary) {
      onAddToLibrary(citationId)
    }
  }

  /**
   * Handle citation click to toggle expanded view
   */
  const handleCitationClick = (citationId: string) => {
    if (expandedCitation === citationId) {
      setExpandedCitation(null)
    } else {
      setExpandedCitation(citationId)
    }
  }

  /**
   * Parse message content to identify and highlight citation references
   * like [1], [2], etc. in the text
   */
  const renderMessageWithCitations = (content: string) => {
    // Find all citation references like [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g
    const parts = content.split(citationRegex)

    if (parts.length === 1) {
      // No citations found, return the original text
      return <p className="whitespace-pre-wrap">{content}</p>
    }

    // Create an array of text and citation elements
    const elements: React.ReactNode[] = []

    for (let i = 0; i < parts.length; i++) {
      // Add regular text
      if (parts[i]) {
        elements.push(<span key={`text-${i}`}>{parts[i]}</span>)
      }

      // Add citation reference
      if (i < parts.length - 1 && parts[i + 1]) {
        const citationNumber = parseInt(parts[i + 1], 10)
        if (!isNaN(citationNumber)) {
          elements.push(
            <span
              key={`citation-${i}`}
              className="bg-primary/10 text-primary hover:bg-primary/20 inline-flex cursor-pointer items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors"
              onClick={() => handleCitationClick(`citation-${citationNumber}`)}
            >
              [{citationNumber}]
            </span>
          )
          // Skip the next part since we've used it as the citation number
          i++
        }
      }
    }

    return <p className="whitespace-pre-wrap leading-relaxed">{elements}</p>
  }

  return (
    <div
      className={cn(
        "flex w-full items-start gap-x-2 py-2",
        isUserMessage ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] flex-col md:max-w-[75%]",
          isUserMessage ? "items-end" : "items-start"
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            "bubble rounded-2xl px-4 py-2",
            isUserMessage
              ? "bg-primary text-primary-foreground rounded-tr-none"
              : "bg-muted rounded-tl-none"
          )}
        >
          {renderMessageWithCitations(message.content)}
        </div>

        {/* Timestamp and actions */}
        <div className="text-muted-foreground mt-1 flex items-center gap-x-2 px-1 text-xs">
          <time dateTime={message.createdAt.toISOString()}>
            {formatDateTime(message.createdAt)}
          </time>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-5"
                  onClick={() => copyToClipboard(message.content)}
                >
                  {isCopied ? (
                    <Check className="size-3" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{isCopied ? "Copied!" : "Copy message"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Citations list - only show for assistant messages */}
        {!isUserMessage && citations.length > 0 && (
          <div className="mt-2 w-full space-y-1">
            {citations.map(citation => (
              <div
                key={citation.id}
                id={citation.id}
                className={cn(
                  "overflow-hidden rounded-lg border text-sm transition-all duration-200",
                  expandedCitation === citation.id ? "p-3" : "p-2"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium">
                    [{citation.referenceNumber}]{" "}
                    {truncateText(
                      citation.title,
                      expandedCitation === citation.id ? 100 : 50
                    )}
                  </div>

                  <div className="flex items-center gap-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={() => handleAddToLibrary(citation.id)}
                    >
                      <BookmarkPlus className="size-4" />
                      <span className="sr-only">Add to library</span>
                    </Button>
                  </div>
                </div>

                {expandedCitation === citation.id && (
                  <div className="text-muted-foreground mt-2">
                    {citation.authors && (
                      <p>
                        <span className="font-medium">Authors:</span>{" "}
                        {citation.authors}
                      </p>
                    )}
                    {citation.journal && (
                      <p>
                        <span className="font-medium">Journal:</span>{" "}
                        {citation.journal}
                      </p>
                    )}
                    {citation.year && (
                      <p>
                        <span className="font-medium">Year:</span>{" "}
                        {citation.year}
                      </p>
                    )}
                    {citation.doi && (
                      <p>
                        <span className="font-medium">DOI:</span> {citation.doi}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
