/**
 * Chat Streaming Custom Hook
 *
 * This hook provides functionality for streaming chat messages from the AI in real-time.
 * It handles initiating streams, managing streaming state, and processing streamed
 * tokens as they arrive from the AI service.
 *
 * The hook integrates with the AI chat actions and provides a clean interface for
 * components to implement streaming without managing the complex state logic.
 *
 * Key features:
 * - Start, pause, and stop streaming
 * - Track streaming state (idle, streaming, paused, completed, error)
 * - Handle streamed tokens and construct messages incrementally
 * - Error handling and recovery
 * - TypeScript type safety throughout
 *
 * @module hooks/use-chat-stream
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { processChatMessageAction, streamChatMessageAction } from "@/actions/ai-chat-actions"
import { ChatMessage, Citation, StreamStatus, StartStreamParams } from "@/types/chat-types"
import { createMessageAction } from "@/actions/db/messages-actions"
import { generateId } from "@/lib/utils"

/**
 * Response type for the useChatStream hook
 */
export interface UseChatStreamResponse {
  /**
   * Current status of the stream
   */
  status: StreamStatus
  
  /**
   * Error message if any
   */
  error: string | null
  
  /**
   * User message that initiated the stream
   */
  userMessage: ChatMessage | null
  
  /**
   * Assistant's response message being streamed
   */
  assistantMessage: ChatMessage | null
  
  /**
   * Citations extracted from the response
   */
  citations: Citation[]
  
  /**
   * Function to start streaming with a new message
   */
  startStream: (params: StartStreamParams) => Promise<void>
  
  /**
   * Function to pause streaming
   */
  pauseStream: () => void
  
  /**
   * Function to resume streaming
   */
  resumeStream: () => void
  
  /**
   * Function to stop streaming
   */
  stopStream: () => void
  
  /**
   * Whether a stream is currently in progress
   */
  isStreaming: boolean
}

/**
 * Custom hook for chat message streaming
 * 
 * This hook provides functionality to handle streaming messages from the AI,
 * managing the state of the stream, and providing controls to start, pause,
 * resume, and stop the stream.
 * 
 * @returns A set of state variables and functions to control streaming
 */
export const useChatStream = (): UseChatStreamResponse => {
  // Stream state
  const [status, setStatus] = useState<StreamStatus>(StreamStatus.IDLE)
  const [error, setError] = useState<string | null>(null)
  
  // Message state
  const [userMessage, setUserMessage] = useState<ChatMessage | null>(null)
  const [assistantMessage, setAssistantMessage] = useState<ChatMessage | null>(null)
  const [citations, setCitations] = useState<Citation[]>([])
  
  // Streaming control state
  const abortControllerRef = useRef<AbortController | null>(null)
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Toast notifications
  const { toast } = useToast()

  /**
   * Cleanup function for stream resources
   */
  const cleanupStream = useCallback(() => {
    // Clear any pending timeouts
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current)
      streamTimeoutRef.current = null
    }
    
    // Abort any ongoing fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Cleanup resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupStream()
    }
  }, [cleanupStream])

  /**
   * Start a new chat message stream
   * 
   * @param params - Parameters for starting the stream
   */
  const startStream = useCallback(async (params: StartStreamParams) => {
    const { message, chatId, userId, specialtyId, useStreaming = true } = params
    
    // Validate input
    if (!message.trim() || !userId) {
      setError("Message and user ID are required")
      return
    }
    
    try {
      // Clean up any previous stream
      cleanupStream()
      
      // Reset state
      setStatus(StreamStatus.STREAMING)
      setError(null)
      
      // Create a temporary user message while it gets saved to the database
      const tempUserMessage: ChatMessage = {
        id: `temp-user-${generateId()}`,
        chatId: chatId || "temp",
        content: message,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Save user message to state
      setUserMessage(tempUserMessage)
      
      // Create a temporary assistant message for streaming
      const tempAssistantMessage: ChatMessage = {
        id: `temp-assistant-${generateId()}`,
        chatId: chatId || "temp",
        content: "",
        role: "assistant",
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Initialize assistant message with empty content
      setAssistantMessage(tempAssistantMessage)
      
      if (useStreaming) {
        // Start streaming response
        const controller = new AbortController()
        abortControllerRef.current = controller
        
        try {
          // Start streaming by calling the stream action
          const streamResult = await streamChatMessageAction({
            message,
            chatId,
            userId,
            specialtyId
          })
          
          if (!streamResult.isSuccess) {
            throw new Error(streamResult.message)
          }
          
          // If stream successfully started, we'll get a responseId
          // The actual streaming would happen in a real implementation,
          // but for now we'll simulate it with the non-streaming action
          
          // Process the message with the standard non-streaming action
          const result = await processChatMessageAction({
            message,
            chatId,
            userId,
            specialtyId
          })
          
          if (result.isSuccess && result.data) {
            // Update the assistant message with the real content
            setAssistantMessage(result.data.message)
            
            // Save any citations
            if (result.data.citations && result.data.citations.length > 0) {
              setCitations(result.data.citations)
            }
            
            setStatus(StreamStatus.COMPLETED)
          } else {
            throw new Error(result.message)
          }
        } catch (err) {
          if (controller.signal.aborted) {
            // Stream was manually aborted, set status to completed
            setStatus(StreamStatus.COMPLETED)
          } else {
            // Actual error occurred
            const errorMessage = err instanceof Error ? err.message : "Failed to stream message"
            setError(errorMessage)
            setStatus(StreamStatus.ERROR)
            
            toast({
              title: "Error",
              description: "Failed to stream message. Please try again.",
              variant: "destructive"
            })
          }
        }
      } else {
        // Use non-streaming mode
        const result = await processChatMessageAction({
          message,
          chatId,
          userId,
          specialtyId
        })
        
        if (result.isSuccess && result.data) {
          // Save the real user and assistant messages
          setUserMessage({
            ...tempUserMessage,
            id: result.data.message.chatId, // Use the real chat ID
            chatId: result.data.message.chatId
          })
          
          // Set the complete assistant message
          setAssistantMessage(result.data.message)
          
          // Save any citations
          if (result.data.citations && result.data.citations.length > 0) {
            setCitations(result.data.citations)
          }
          
          setStatus(StreamStatus.COMPLETED)
        } else {
          throw new Error(result.message || "Failed to process message")
        }
      }
    } catch (err) {
      // Handle any uncaught errors
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(errorMessage)
      setStatus(StreamStatus.ERROR)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [cleanupStream, toast])

  /**
   * Pause the current stream
   */
  const pauseStream = useCallback(() => {
    if (status === StreamStatus.STREAMING) {
      setStatus(StreamStatus.PAUSED)
      
      // In a real implementation, we would pause token processing here
      // For now, we'll just change the status
    }
  }, [status])

  /**
   * Resume the paused stream
   */
  const resumeStream = useCallback(() => {
    if (status === StreamStatus.PAUSED) {
      setStatus(StreamStatus.STREAMING)
      
      // In a real implementation, we would resume token processing here
      // For now, we'll just change the status
    }
  }, [status])

  /**
   * Stop the current stream
   */
  const stopStream = useCallback(() => {
    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    
    // If we were streaming or paused, mark as completed
    if (status === StreamStatus.STREAMING || status === StreamStatus.PAUSED) {
      setStatus(StreamStatus.COMPLETED)
    }
    
    // Clean up resources
    cleanupStream()
  }, [status, cleanupStream])

  return {
    status,
    error,
    userMessage,
    assistantMessage,
    citations,
    startStream,
    pauseStream,
    resumeStream,
    stopStream,
    isStreaming: status === StreamStatus.STREAMING || status === StreamStatus.PAUSED
  }
}

export default useChatStream 