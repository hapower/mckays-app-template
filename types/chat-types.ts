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
  message: ChatMessage
  citations?: Citation[]
  onAddToLibrary?: (citationId: string) => void
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
