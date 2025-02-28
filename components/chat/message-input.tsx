/**
 * Message Input Component
 *
 * This component provides an input field for users to type messages in the chat interface.
 * It handles form submission, keyboard shortcuts, and loading states.
 *
 * Features:
 * - Textarea for message input
 * - Send button with loading indicator
 * - Keyboard shortcuts (Ctrl+Enter or Cmd+Enter) to send messages
 * - Proper handling of empty messages and loading states
 *
 * @module components/chat/message-input
 */

"use client"

import { FormEvent, KeyboardEvent, useState } from "react"
import { Loader2, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { MessageInputProps } from "@/types/chat-types"

/**
 * MessageInput Component
 *
 * @param onSend - Callback function to handle sending messages
 * @param isLoading - Boolean indicating if a message is currently being processed
 * @param placeholder - Optional placeholder text for the input field
 */
export function MessageInput({
  onSend,
  isLoading,
  placeholder = "Type your medical question here..."
}: MessageInputProps) {
  const [message, setMessage] = useState("")

  /**
   * Handle form submission
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Trim message and check if it's not empty
    const trimmedMessage = message.trim()
    if (trimmedMessage && !isLoading) {
      onSend(trimmedMessage)
      setMessage("")
    }
  }

  /**
   * Handle keyboard shortcuts (Ctrl+Enter or Cmd+Enter to submit)
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      const trimmedMessage = message.trim()
      if (trimmedMessage && !isLoading) {
        onSend(trimmedMessage)
        setMessage("")
        e.preventDefault() // Prevent newline insertion
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex w-full items-end gap-x-2">
        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className={cn(
            "border-input bg-background min-h-12 resize-none rounded-lg border px-3 py-2 text-sm",
            "focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-1",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          rows={1}
        />

        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !message.trim()}
          className={cn(
            "size-10 rounded-full",
            "transition-opacity duration-200",
            !message.trim() || isLoading ? "opacity-70" : "opacity-100"
          )}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </div>

      {/* Processing indicator */}
      <div className="text-muted-foreground mt-1 text-right text-xs">
        {isLoading && "Processing message..."}
      </div>
    </form>
  )
}
