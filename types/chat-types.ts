/**
 * Type definitions for chat-related functionality
 *
 * These types are used throughout the application for chat messages, citations,
 * and RAG (Retrieval Augmented Generation) operations.
 *
 * @module types/chat-types
 */

import { SelectSpecialty } from "@/db/schema"

/**
 * Role types for chat messages (matching the roleEnum in the database)
 */
export type MessageRole = "user" | "assistant"

/**
 * Interface for a chat message (matching the messagesTable schema)
 */
export interface ChatMessage {
  id: string
  chatId: string
  content: string
  role: MessageRole
  createdAt: Date
  updatedAt: Date
}

/**
 * Interface for a citation in a message (matching the citationsTable schema)
 */
export interface Citation {
  id: string
  messageId: string
  title: string
  authors?: string
  journal?: string
  year?: string
  doi?: string
  url?: string
  referenceNumber?: number
  inLibrary: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Interface for a chat session (matching the chatsTable schema)
 */
export interface Chat {
  id: string
  userId: string
  specialtyId?: string
  title: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Props for the chat interface component
 */
export interface ChatInterfaceProps {
  userId: string
  specialtyId?: string
}

/**
 * Interface for chat state in client components
 */
export interface ChatState {
  chatId: string | null
  messages: ChatMessage[]
  citations: Citation[]
  isLoading: boolean
  error?: string
}

/**
 * RAG result type for retrieved documents
 */
export interface RAGResult {
  id: string
  content: string
  metadata: {
    title?: string
    authors?: string
    journal?: string
    year?: string
    doi?: string
    url?: string
    [key: string]: any
  }
  similarity: number
}

/**
 * Streaming response for AI
 */
export interface StreamingResponse {
  id: string
  content: string
  role: MessageRole
  citations?: Citation[]
  completed: boolean
}

/**
 * Props for the message bubble component
 */
export interface MessageBubbleProps {
  /**
   * The message to display
   */
  message: ChatMessage

  /**
   * Optional array of citations associated with the message
   */
  citations?: Citation[]

  /**
   * Optional callback when adding a citation to the library
   */
  onAddToLibrary?: (citationId: string) => void

  /**
   * Whether this message is currently being streamed
   */
  isStreaming?: boolean
}

/**
 * Props for the message input component
 */
export interface MessageInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  placeholder?: string
}

/**
 * Props for the citation bubble component
 */
export interface CitationBubbleProps {
  citation: Citation
  onAddToLibrary?: (id: string) => void
  inLibrary: boolean
}

/**
 * Stream status types for chat message streaming
 */
export enum StreamStatus {
  IDLE = "idle",
  STREAMING = "streaming",
  PAUSED = "paused",
  COMPLETED = "completed",
  ERROR = "error"
}

/**
 * Parameters for starting a chat stream
 */
export interface StartStreamParams {
  /**
   * The content of the user message
   */
  message: string

  /**
   * The ID of the chat this message belongs to
   */
  chatId?: string

  /**
   * The ID of the user sending the message
   */
  userId: string

  /**
   * Optional ID of the specialty for domain-specific responses
   */
  specialtyId?: string

  /**
   * Whether to use streaming mode (vs. standard mode)
   */
  useStreaming?: boolean
}
