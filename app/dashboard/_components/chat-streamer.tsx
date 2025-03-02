/**
 * Chat Streamer Component
 *
 * This component provides the core chat interface for the AttendMe dashboard.
 * It manages the state of the chat, handles sending and receiving messages,
 * displays message history, and shows citations from AI responses.
 *
 * Features:
 * - Displays chat messages with proper styling for user and AI messages
 * - Handles sending new messages to the AI with streaming support
 * - Manages loading states during AI response generation
 * - Displays citations from AI responses with options to add to library
 * - Supports streaming responses for a better user experience
 * - Integrates with AI chat provider for state management
 *
 * @module app/dashboard/_components/chat-streamer
 */

"use client"

import { useEffect, useRef, useState } from "react"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { CitationItem } from "@/components/chat/citation-item"
import { ChatSkeleton } from "@/components/chat/chat-skeleton"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Pause, Play, StopCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { AIChatProvider, useAIChat } from "@/components/chat/ai-chat-provider"
import { useChatStream } from "@/hooks/use-chat-stream"
import { StreamStatus } from "@/types/chat-types"
import { Button } from "@/components/ui/button"

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
 * Chat Streamer Wrapper Component
 *
 * This is a wrapper component that provides the AIChatProvider context
 * to the inner ChatStreamerInner component.
 *
 * @param props - The props for the ChatStreamer component
 * @returns A React component that renders the chat interface
 */
export function ChatStreamer(props: ChatStreamerProps) {
  return (
    <AIChatProvider
      userId={props.userId}
      initialChatId={props.chatId}
      initialSpecialtyId={props.specialtyId}
    >
      <ChatStreamerInner {...props} />
    </AIChatProvider>
  )
}

/**
 * Inner Chat Streamer Component
 *
 * This component handles the actual rendering of the chat interface
 * and uses the AIChatProvider context through the useAIChat hook.
 * It now also incorporates streaming functionality using the useChatStream hook.
 *
 * @param props - The props for the ChatStreamer component
 * @returns A React component that renders the chat interface
 */
function ChatStreamerInner({
  userId,
  specialtyId = undefined,
  chatId = undefined,
  className
}: ChatStreamerProps) {
  // Get chat state and methods from the AIChatProvider context
  const {
    messages,
    citations,
    isLoading: isContextLoading,
    error: contextError,
    currentSpecialty,
    sendMessage: sendContextMessage,
    addToLibrary,
    setActiveChatId
  } = useAIChat()

  // Use the chat streaming hook for streaming functionality
  const {
    status: streamStatus,
    error: streamError,
    userMessage,
    assistantMessage,
    citations: streamCitations,
    startStream,
    pauseStream,
    resumeStream,
    stopStream,
    isStreaming
  } = useChatStream()

  // Local state
  const [useStreamingMode, setUseStreamingMode] = useState(true)
  const [streamProgress, setStreamProgress] = useState(0)
  const [combinedMessages, setCombinedMessages] = useState(messages)

  // Reference to message container for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Toast notifications
  const { toast } = useToast()

  // Combine regular messages with streaming messages
  useEffect(() => {
    // Start with all regular messages
    let newMessages = [...messages]

    // If we have a temporary user message from streaming, add it
    if (
      userMessage &&
      !messages.some(
        m => m.id === userMessage.id || m.content === userMessage.content
      )
    ) {
      newMessages.push(userMessage)
    }

    // If we have a streaming assistant message, add it
    if (assistantMessage && !messages.some(m => m.id === assistantMessage.id)) {
      newMessages.push(assistantMessage)
    }

    // Sort messages by creation time to ensure proper order
    newMessages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    setCombinedMessages(newMessages)
  }, [messages, userMessage, assistantMessage])

  // Scroll to the bottom of the messages when new ones are added
  useEffect(() => {
    scrollToBottom()
  }, [combinedMessages])

  // Handle streaming progress for visual indicators
  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null

    if (streamStatus === StreamStatus.STREAMING) {
      // Simulate stream progress by incrementing gradually
      progressInterval = setInterval(() => {
        setStreamProgress(prev => {
          const newProgress = prev + 1
          return newProgress > 99 ? 99 : newProgress // Max at 99% until complete
        })
      }, 100)
    } else if (
      streamStatus === StreamStatus.COMPLETED ||
      streamStatus === StreamStatus.ERROR
    ) {
      // When complete, set to 100%
      setStreamProgress(100)
    } else if (streamStatus === StreamStatus.IDLE) {
      // Reset progress when idle
      setStreamProgress(0)
    }

    // Clean up interval
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [streamStatus])

  // When a stream completes, update the chat context with the final message
  useEffect(() => {
    if (streamStatus === StreamStatus.COMPLETED && assistantMessage) {
      // In a real implementation, we would sync the streamed message with the AI chat context
      // This could involve either:
      // 1. Adding the message directly to the context state
      // 2. Triggering a refresh to fetch the latest messages
      // For now, we can rely on the messages being added to the database and
      // fetched on the next render or chat reload
    }
  }, [streamStatus, assistantMessage])

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
    if (!content.trim() || isContextLoading || isStreaming) return

    try {
      if (useStreamingMode) {
        // Use streaming mode
        await startStream({
          message: content,
          chatId: chatId || undefined,
          userId,
          specialtyId: currentSpecialty?.id || undefined,
          useStreaming: true
        })
      } else {
        // Use standard non-streaming mode via context
        await sendContextMessage(content)
      }
    } catch (error) {
      console.error("Error sending message:", error)

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      })
    }
  }

  /**
   * Handle adding a citation to the user's library
   *
   * @param citationId - The ID of the citation to add
   */
  const handleAddToLibrary = async (citationId: string) => {
    try {
      await addToLibrary(citationId)
    } catch (error) {
      console.error("Error adding to library:", error)

      toast({
        title: "Error",
        description: "Failed to add to library. Please try again.",
        variant: "destructive"
      })
    }
  }

  /**
   * Handle streaming control buttons
   */
  const handlePauseStream = () => {
    pauseStream()
  }

  const handleResumeStream = () => {
    resumeStream()
  }

  const handleStopStream = () => {
    stopStream()
  }

  /**
   * Toggle streaming mode
   */
  const toggleStreamingMode = () => {
    setUseStreamingMode(!useStreamingMode)
  }

  // Render welcome message if no messages exist yet
  const renderWelcomeMessage = () => {
    if (combinedMessages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-2xl font-bold">Welcome to AttendMe</h2>
          <p className="text-muted-foreground mb-8 mt-2 max-w-md">
            Your AI medical assistant to help answer your questions with
            evidence-based information.
            {currentSpecialty.id && " Specialty mode activated."}
          </p>
          <p className="text-muted-foreground text-sm">
            Type your medical question below to get started.
          </p>

          {/* Streaming mode toggle */}
          <div className="mt-6 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleStreamingMode}
              className={useStreamingMode ? "bg-primary/10" : ""}
            >
              {useStreamingMode ? "Streaming mode: ON" : "Streaming mode: OFF"}
            </Button>
          </div>
        </div>
      )
    }
    return null
  }

  // Handle active chat message display
  const renderChatMessages = () => {
    return combinedMessages.map(message => {
      // Check if this is a temporary streaming message
      const isStreamingMessage =
        (userMessage && message.id === userMessage.id) ||
        (assistantMessage && message.id === assistantMessage.id)

      // Find citations for this message
      let messageCitations = citations.filter(
        citation => citation.messageId === message.id
      )

      // If this is the streaming assistant message, use stream citations
      if (assistantMessage && message.id === assistantMessage.id) {
        messageCitations = streamCitations
      }

      return (
        <MessageBubble
          key={message.id}
          message={message}
          citations={messageCitations}
          onAddToLibrary={handleAddToLibrary}
          isStreaming={
            isStreamingMessage && streamStatus === StreamStatus.STREAMING
              ? true
              : undefined
          }
        />
      )
    })
  }

  // Show citations horizontally below the last assistant message
  const renderCitations = () => {
    // Only show citations if we have some and we're not loading
    if (
      (citations.length === 0 && streamCitations.length === 0) ||
      (isContextLoading && streamStatus !== StreamStatus.COMPLETED)
    ) {
      return null
    }

    // Get citations for the last assistant message
    const lastAssistantMessage = [...combinedMessages]
      .reverse()
      .find(msg => msg.role === "assistant" && !msg.id.startsWith("temp"))

    // Determine which citations to show
    let relevantCitations = citations

    if (assistantMessage && assistantMessage.id === lastAssistantMessage?.id) {
      // Use stream citations if the last message is the streaming one
      relevantCitations = streamCitations
    } else {
      // Otherwise use regular citations
      relevantCitations = citations.filter(
        citation =>
          citation.messageId === lastAssistantMessage?.id || !citation.messageId
      )
    }

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

  // Render streaming controls when a message is being streamed
  const renderStreamingControls = () => {
    if (!isStreaming) return null

    return (
      <div className="mb-4 flex items-center justify-center space-x-2">
        {streamStatus === StreamStatus.STREAMING ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePauseStream}
            className="size-8 p-0"
          >
            <Pause className="size-4" />
            <span className="sr-only">Pause</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleResumeStream}
            className="size-8 p-0"
          >
            <Play className="size-4" />
            <span className="sr-only">Resume</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleStopStream}
          className="size-8 p-0"
        >
          <StopCircle className="size-4" />
          <span className="sr-only">Stop</span>
        </Button>

        <div className="text-muted-foreground ml-2 text-xs">
          {streamStatus === StreamStatus.STREAMING ? "Streaming..." : "Paused"}
        </div>
      </div>
    )
  }

  // Error display component
  const renderError = () => {
    const error = contextError || streamError
    if (!error) return null

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="size-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Get the appropriate title based on specialty
  const getPanelTitle = () => {
    if (currentSpecialty.id && currentSpecialty.name) {
      return `${currentSpecialty.name} Assistant`
    }
    return "Medical Assistant"
  }

  // If there are no messages yet, show the welcome message
  const isEmpty = combinedMessages.length === 0

  // Determine loading state by combining context loading and stream status
  const isLoading =
    isContextLoading ||
    streamStatus === StreamStatus.STREAMING ||
    streamStatus === StreamStatus.PAUSED

  return (
    <ChatPanel
      title={getPanelTitle()}
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
          {renderStreamingControls()}
          <div ref={messagesEndRef} />
        </>
      )}

      {/* Show skeleton if loading but not streaming */}
      {isContextLoading && !isStreaming && (
        <div className="opacity-60">
          <ChatSkeleton className="mt-4" messageCount={1} />
        </div>
      )}
    </ChatPanel>
  )
}
