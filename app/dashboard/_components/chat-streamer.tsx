/**
 * Chat Streamer Component
 *
 * This component provides the core chat interface for the AttendMe dashboard.
 * It manages the state of the chat, handles sending and receiving messages,
 * displays message history, and shows citations from AI responses.
 *
 * Features:
 * - Displays chat messages with proper styling for user and AI messages
 * - Handles sending new messages to the AI
 * - Manages loading states during AI response generation
 * - Displays citations from AI responses with options to add to library
 * - Supports streaming responses for a better user experience
 *
 * @module app/dashboard/_components/chat-streamer
 */

"use client"

import { useEffect, useState, useRef } from "react"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { CitationItem } from "@/components/chat/citation-item"
import { ChatSkeleton } from "@/components/chat/chat-skeleton"
import { processChatMessageAction } from "@/actions/ai-chat-actions"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ChatMessage, Citation } from "@/types/chat-types"

/**
 * Props for the ChatStreamer component
 */
interface ChatStreamerProps {
  /**
   * The user ID for the current user
   */
  userId: string

  /**
   * Optional specialty ID to focus the AI responses
   */
  specialtyId?: string | null

  /**
   * Optional chat ID for continuing an existing chat
   */
  chatId?: string | null

  /**
   * Optional CSS class names
   */
  className?: string
}

/**
 * Chat Streamer Component
 *
 * Renders a complete chat interface with message history and input.
 *
 * @example
 * ```tsx
 * <ChatStreamer userId="user123" specialtyId="cardiology" />
 * ```
 */
export function ChatStreamer({
  userId,
  specialtyId = null,
  chatId = null,
  className
}: ChatStreamerProps) {
  // State for chat messages and UI state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId)

  // Reference to message container for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Toast notifications
  const { toast } = useToast()

  // Scroll to the bottom of the messages when new ones are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to scroll to the bottom of the message container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  /**
   * Handle sending a new message to the AI
   *
   * @param content - The message text to send
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Clear any previous errors
    setError(null)
    setIsLoading(true)

    try {
      // Create a temporary user message to show immediately
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        chatId: currentChatId || "temp",
        content,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Add the user message to the UI
      setMessages(prev => [...prev, tempUserMessage])

      // Create a temporary loading message from the assistant
      const tempAssistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        chatId: currentChatId || "temp",
        content: "Thinking...",
        role: "assistant",
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Wait a moment, then show the loading message
      setTimeout(() => {
        if (isLoading) {
          setMessages(prev => [...prev, tempAssistantMessage])
        }
      }, 500)

      // Process the message with the AI
      const result = await processChatMessageAction({
        message: content,
        chatId: currentChatId || undefined,
        userId,
        specialtyId: specialtyId || undefined
      })

      // Handle the response
      if (result.isSuccess && result.data) {
        // If this is a new chat, save the chat ID
        if (!currentChatId && result.data.message.chatId) {
          setCurrentChatId(result.data.message.chatId)
        }

        // Remove the temporary messages and add the real ones
        setMessages(prev =>
          prev
            .filter(msg => !msg.id.startsWith("temp"))
            .concat([
              {
                ...tempUserMessage,
                id: tempUserMessage.id.replace("temp-", ""),
                chatId: result.data.message.chatId
              },
              result.data.message
            ])
        )

        // Save any citations
        if (result.data.citations && result.data.citations.length > 0) {
          setCitations(prev => [
            ...prev,
            ...(result.data.citations as Citation[])
          ])
        }
      } else {
        // Handle error in the response
        setError(
          result.message || "Failed to get a response. Please try again."
        )

        // Remove the temporary assistant message, keep the user message
        setMessages(prev =>
          prev.filter(msg => msg.id !== tempAssistantMessage.id)
        )

        toast({
          title: "Error",
          description: result.message || "Failed to process your message",
          variant: "destructive"
        })
      }
    } catch (err) {
      // Handle unexpected errors
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      console.error("Error processing message:", err)

      toast({
        title: "Error",
        description: "Something went wrong while processing your message",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle adding a citation to the user's library
   *
   * @param citationId - The ID of the citation to add
   */
  const handleAddToLibrary = async (citationId: string) => {
    try {
      // For now, just show a toast notification
      // In a future step, this will call a server action to save to the library
      toast({
        title: "Added to Library",
        description: "Citation added to your library"
      })

      // Update the citation in the UI to show it's in the library
      setCitations(prev =>
        prev.map(citation =>
          citation.id === citationId
            ? { ...citation, inLibrary: true }
            : citation
        )
      )
    } catch (err) {
      console.error("Error adding citation to library:", err)
      toast({
        title: "Error",
        description: "Failed to add citation to library",
        variant: "destructive"
      })
    }
  }

  // Render welcome message if no messages exist yet
  const renderWelcomeMessage = () => {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-bold">Welcome to AttendMe</h2>
          <p className="text-muted-foreground mb-8 mt-2 max-w-md">
            Your AI medical assistant to help answer your questions with
            evidence-based information.
            {specialtyId && " Specialty mode activated."}
          </p>
          <p className="text-muted-foreground text-sm">
            Type your medical question below to get started.
          </p>
        </div>
      )
    }
    return null
  }

  // Handle active chat message display
  const renderChatMessages = () => {
    return messages.map(message => {
      // Find citations for this message
      const messageCitations = citations.filter(
        citation => citation.messageId === message.id
      )

      return (
        <MessageBubble
          key={message.id}
          message={message}
          citations={messageCitations}
          onAddToLibrary={handleAddToLibrary}
        />
      )
    })
  }

  // Show citations horizontally below the last assistant message
  const renderCitations = () => {
    // Only show citations if we have some and we're not loading
    if (citations.length === 0 || isLoading) return null

    // Get citations for the last assistant message
    const lastAssistantMessage = [...messages]
      .reverse()
      .find(msg => msg.role === "assistant" && !msg.id.startsWith("temp"))

    if (!lastAssistantMessage) return null

    const relevantCitations = citations.filter(
      citation =>
        citation.messageId === lastAssistantMessage.id || !citation.messageId
    )

    if (relevantCitations.length === 0) return null

    return (
      <div className="mb-4 mt-2">
        <p className="text-muted-foreground mb-2 text-sm font-medium">
          References:
        </p>
        <ScrollArea className="max-w-full whitespace-nowrap pb-2">
          <div className="flex space-x-2">
            {relevantCitations.map(citation => (
              <CitationItem
                key={citation.id}
                citation={citation}
                onAddToLibrary={handleAddToLibrary}
                inLibrary={citation.inLibrary || false}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // Error display component
  const renderError = () => {
    if (!error) return null

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // If there are no messages yet, show the welcome message
  const isEmpty = messages.length === 0

  return (
    <ChatPanel
      title={specialtyId ? "Specialty Chat" : "Medical Assistant"}
      className={className}
      isLoading={isLoading}
      footer={
        <MessageInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder="Type your medical question here..."
        />
      }
    >
      {/* Error message display */}
      {renderError()}

      {/* Welcome message or chat messages */}
      {isEmpty ? (
        renderWelcomeMessage()
      ) : (
        <>
          {renderChatMessages()}
          {renderCitations()}
          <div ref={messagesEndRef} />
        </>
      )}

      {/* Show skeleton if loading */}
      {isLoading && (
        <div className="opacity-60">
          <ChatSkeleton className="mt-4" messageCount={1} />
        </div>
      )}
    </ChatPanel>
  )
}
