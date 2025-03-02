/**
 * AI Chat Provider Component
 *
 * This component provides a React Context for managing the AI chat state and functionality
 * throughout the application. It handles chat messages, citations, loading states, and errors,
 * as well as providing methods for sending messages to the AI, selecting specialties, and
 * managing the chat state.
 *
 * Key features:
 * - Global chat state management via React Context
 * - Message sending and processing with AI
 * - Specialty selection for domain-specific responses
 * - Citation tracking and library management
 * - Loading and error states
 *
 * @module components/chat/ai-chat-provider
 */

"use client"

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode
} from "react"
import {
  processChatMessageAction,
  generateChatTitleAction
} from "@/actions/ai-chat-actions"
import {
  selectSpecialtyAction,
  changeSpecialtyAction,
  clearSpecialtyAction
} from "@/actions/specialty-prompt-actions"
import { addCitationToLibraryAction } from "@/actions/reference-extraction-actions"
import { ChatMessage, Citation, Chat } from "@/types/chat-types"
import { SelectSpecialty } from "@/db/schema"
import { getChatMessagesAction } from "@/actions/db/messages-actions"
import { getChatByIdAction } from "@/actions/db/chats-actions"
import { getMessageCitationsAction } from "@/actions/reference-extraction-actions"
import { useToast } from "@/hooks/use-toast"

/**
 * Interface for the AI Chat Context state and methods
 */
interface AIChatContextType {
  // Chat state
  chatId: string | null
  messages: ChatMessage[]
  citations: Citation[]
  isLoading: boolean
  error: string | null

  // Chat metadata
  currentSpecialty: {
    id: string | null
    name: string | null
  }

  // Methods
  sendMessage: (message: string) => Promise<void>
  selectSpecialty: (specialty: SelectSpecialty) => Promise<void>
  clearSpecialty: () => Promise<void>
  addToLibrary: (citationId: string) => Promise<void>
  resetChat: () => void
  setActiveChatId: (id: string | null) => Promise<void>
}

/**
 * Props for the AIChatProvider component
 */
interface AIChatProviderProps {
  children: ReactNode
  userId: string
  initialChatId?: string | null
  initialSpecialtyId?: string | null
}

// Create the context with a default value
const AIChatContext = createContext<AIChatContextType | undefined>(undefined)

/**
 * AI Chat Provider Component
 *
 * This provider manages the state and functionality for the AI chat system.
 *
 * @param children - Child components that will have access to the context
 * @param userId - The ID of the current user
 * @param initialChatId - Optional ID of a chat to load initially
 * @param initialSpecialtyId - Optional ID of a specialty to select initially
 */
export const AIChatProvider: React.FC<AIChatProviderProps> = ({
  children,
  userId,
  initialChatId = null,
  initialSpecialtyId = null
}) => {
  // Chat state
  const [chatId, setChatId] = useState<string | null>(initialChatId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Specialty state
  const [currentSpecialty, setCurrentSpecialty] = useState<{
    id: string | null
    name: string | null
  }>({
    id: initialSpecialtyId,
    name: null
  })

  // Get toast notification function
  const { toast } = useToast()

  /**
   * Load an existing chat when chatId changes
   */
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) {
        setMessages([])
        setCitations([])
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Get chat metadata
        const chatResult = await getChatByIdAction(chatId)
        if (!chatResult.isSuccess || !chatResult.data) {
          throw new Error(chatResult.message || "Failed to load chat")
        }

        // Get chat messages
        const messagesResult = await getChatMessagesAction(chatId)
        if (!messagesResult.isSuccess) {
          throw new Error(messagesResult.message || "Failed to load messages")
        }

        // Update specialty information if chat has a specialty
        const specialtyId = chatResult.data.specialtyId
        if (specialtyId) {
          setCurrentSpecialty(prev => ({
            ...prev,
            id: specialtyId
          }))
        }

        // Load and process messages
        const chatMessages = messagesResult.data || []
        setMessages(chatMessages)

        // Load citations for each assistant message
        const allCitations: Citation[] = []

        for (const message of chatMessages) {
          if (message.role === "assistant") {
            const citationResult = await getMessageCitationsAction(message.id)
            if (citationResult.isSuccess && citationResult.data) {
              allCitations.push(...citationResult.data)
            }
          }
        }

        setCitations(allCitations)
      } catch (err) {
        console.error("Error loading chat:", err)
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load chat"
        setError(errorMessage)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadChat()
  }, [chatId, toast])

  /**
   * Initialize specialty name when ID is present
   */
  useEffect(() => {
    if (currentSpecialty.id && !currentSpecialty.name) {
      // This would be more robust with a specialty lookup,
      // but for simplicity we'll handle it when selecting a specialty
    }
  }, [currentSpecialty])

  /**
   * Send a message to the AI and process the response
   *
   * @param message - The message text to send
   */
  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isLoading) return

      setIsLoading(true)
      setError(null)

      try {
        // Create a temporary user message to show immediately
        const tempUserMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          chatId: chatId || "temp",
          content: message,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date()
        }

        // Add the user message to the UI
        setMessages(prev => [...prev, tempUserMessage])

        // Process the message with the AI
        const result = await processChatMessageAction({
          message,
          chatId: chatId || undefined,
          userId,
          specialtyId: currentSpecialty.id || undefined
        })

        // Handle the response
        if (result.isSuccess && result.data) {
          // If this is a new chat, save the chat ID
          if (!chatId && result.data.message.chatId) {
            setChatId(result.data.message.chatId)
          }

          // Remove temporary messages and add real ones
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
            setCitations(prev => [...prev, ...(result.data.citations || [])])
          }
        } else {
          // Handle error in the response
          const errorMessage =
            result.message || "Failed to get a response. Please try again."
          setError(errorMessage)

          // Remove temporary messages but keep the user message
          setMessages(prev =>
            prev.filter(
              msg =>
                !msg.id.startsWith("temp-") || msg.id === tempUserMessage.id
            )
          )

          toast({
            title: "Error",
            description: errorMessage,
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
    },
    [chatId, isLoading, userId, currentSpecialty.id, toast]
  )

  /**
   * Add a citation to the user's library
   *
   * @param citationId - The ID of the citation to add
   */
  const addToLibrary = useCallback(
    async (citationId: string) => {
      try {
        // Update the citation in the UI to show it's in the library
        setCitations(prev =>
          prev.map(citation =>
            citation.id === citationId
              ? { ...citation, inLibrary: true }
              : citation
          )
        )

        // Add the citation to the library
        const result = await addCitationToLibraryAction(citationId, userId)

        if (result.isSuccess) {
          toast({
            title: "Added to Library",
            description: "Citation added to your library successfully"
          })
        } else {
          // Revert the UI change if failed
          setCitations(prev =>
            prev.map(citation =>
              citation.id === citationId
                ? { ...citation, inLibrary: false }
                : citation
            )
          )

          toast({
            title: "Error",
            description: result.message || "Failed to add citation to library",
            variant: "destructive"
          })
        }
      } catch (err) {
        console.error("Error adding citation to library:", err)

        // Revert the UI change
        setCitations(prev =>
          prev.map(citation =>
            citation.id === citationId
              ? { ...citation, inLibrary: false }
              : citation
          )
        )

        toast({
          title: "Error",
          description: "Failed to add citation to library",
          variant: "destructive"
        })
      }
    },
    [userId, toast]
  )

  /**
   * Select a specialty for the chat
   *
   * @param specialty - The specialty object to select
   */
  const selectSpecialty = useCallback(
    async (specialty: SelectSpecialty) => {
      try {
        setIsLoading(true)
        setError(null)

        // If we have an active chat, change the specialty
        if (chatId) {
          // Get the current specialty ID before changing
          const prevSpecialtyId = currentSpecialty.id || null

          // Change the specialty for the current chat
          const result = await changeSpecialtyAction(
            chatId,
            specialty.id,
            prevSpecialtyId || ""
          )

          if (result.isSuccess && result.data) {
            // Update the specialty state
            setCurrentSpecialty({
              id: specialty.id,
              name: specialty.name
            })

            // If there's a transition message, add it to the chat
            if (result.data.transitionMessage) {
              // Create a system message for the transition
              const transitionMessage: ChatMessage = {
                id: `system-${Date.now()}`,
                chatId,
                content: result.data.transitionMessage,
                role: "assistant",
                createdAt: new Date(),
                updatedAt: new Date()
              }

              // Add the transition message to the UI
              setMessages(prev => [...prev, transitionMessage])
            }

            toast({
              title: "Specialty Changed",
              description: `Switched to ${specialty.name} specialty`
            })
          } else {
            throw new Error(result.message || "Failed to change specialty")
          }
        } else {
          // For a new chat, just select the specialty
          const result = await selectSpecialtyAction(
            specialty.id,
            undefined,
            undefined
          )

          if (result.isSuccess && result.data) {
            // Update the specialty state
            setCurrentSpecialty({
              id: specialty.id,
              name: specialty.name
            })

            toast({
              title: "Specialty Selected",
              description: `Selected ${specialty.name} specialty`
            })
          } else {
            throw new Error(result.message || "Failed to select specialty")
          }
        }
      } catch (err) {
        console.error("Error selecting specialty:", err)
        const errorMessage =
          err instanceof Error ? err.message : "Failed to select specialty"
        setError(errorMessage)

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    },
    [chatId, currentSpecialty.id, toast]
  )

  /**
   * Clear the current specialty
   */
  const clearSpecialty = useCallback(async () => {
    if (!chatId || !currentSpecialty.id) return

    try {
      setIsLoading(true)
      setError(null)

      // Clear the specialty for the current chat
      const result = await clearSpecialtyAction(chatId)

      if (result.isSuccess) {
        // Update the specialty state
        setCurrentSpecialty({
          id: null,
          name: null
        })

        toast({
          title: "Specialty Cleared",
          description: "Switched to general medical mode"
        })
      } else {
        throw new Error(result.message || "Failed to clear specialty")
      }
    } catch (err) {
      console.error("Error clearing specialty:", err)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear specialty"
      setError(errorMessage)

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [chatId, currentSpecialty.id, toast])

  /**
   * Reset the chat state for a new conversation
   */
  const resetChat = useCallback(() => {
    setChatId(null)
    setMessages([])
    setCitations([])
    setError(null)
    // Keep the specialty if one is selected
  }, [])

  /**
   * Set the active chat ID and load that chat
   *
   * @param id - The ID of the chat to activate
   */
  const setActiveChatId = useCallback(async (id: string | null) => {
    setChatId(id)
  }, [])

  // The value object provided to the context consumers
  const contextValue: AIChatContextType = {
    // State
    chatId,
    messages,
    citations,
    isLoading,
    error,
    currentSpecialty,

    // Methods
    sendMessage,
    selectSpecialty,
    clearSpecialty,
    addToLibrary,
    resetChat,
    setActiveChatId
  }

  return (
    <AIChatContext.Provider value={contextValue}>
      {children}
    </AIChatContext.Provider>
  )
}

/**
 * Custom hook to use the AI Chat context
 *
 * @returns The AI Chat context value
 * @throws Error if used outside of an AIChatProvider
 */
export const useAIChat = (): AIChatContextType => {
  const context = useContext(AIChatContext)

  if (context === undefined) {
    throw new Error("useAIChat must be used within an AIChatProvider")
  }

  return context
}
