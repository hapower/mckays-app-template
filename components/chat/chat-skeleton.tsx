/**
 * Chat Skeleton Component
 *
 * This component provides a loading skeleton UI for the chat interface.
 * It displays placeholder elements for messages and input while data is loading.
 *
 * Features:
 * - Configurable number of skeleton messages
 * - Alternating user/assistant message layout
 * - Different skeleton styles for each message type
 * - Skeleton for the input area
 *
 * @module components/chat/chat-skeleton
 */

"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * ChatSkeleton Component Props
 */
interface ChatSkeletonProps {
  messageCount?: number
  className?: string
}

/**
 * ChatSkeleton Component
 *
 * @param messageCount - Number of skeleton messages to display (default: 3)
 * @param className - Additional CSS classes
 */
export function ChatSkeleton({
  messageCount = 3,
  className
}: ChatSkeletonProps) {
  return (
    <div className={cn("flex w-full flex-col space-y-4", className)}>
      {/* Chat messages loading skeleton */}
      <div className="flex-1 space-y-4">
        {/* Generate skeleton message bubbles */}
        {Array.from({ length: messageCount }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "flex w-full items-start gap-x-2 py-2",
              index % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            <div
              className={cn(
                "flex max-w-[75%] flex-col",
                index % 2 === 0 ? "items-start" : "items-end"
              )}
            >
              {/* Message bubble skeleton */}
              <Skeleton
                className={cn(
                  "h-[60px] w-[250px] rounded-2xl",
                  index % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"
                )}
              />

              {/* Timestamp skeleton */}
              <Skeleton className="mt-1 h-4 w-20" />

              {/* Citation skeleton - only for assistant messages */}
              {index % 2 === 0 && (
                <div className="mt-2 space-y-1">
                  <Skeleton className="h-8 w-[200px] rounded-lg" />
                  {index === 0 && (
                    <Skeleton className="h-8 w-[180px] rounded-lg" />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input area skeleton */}
      <div className="bg-background sticky bottom-0 pt-2">
        <div className="flex w-full items-end gap-x-2">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
    </div>
  )
}
