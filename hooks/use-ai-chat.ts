/**
 * AI Chat Custom Hook
 * 
 * This hook provides a simplified interface for using the AI Chat context throughout the application.
 * It re-exports the useAIChat hook from the AIChatProvider component for consistent access.
 * 
 * Using this hook, components can:
 * - Send messages to the AI and receive responses
 * - Select medical specialties for domain-specific knowledge
 * - Manage citations and add them to the user's library
 * - Handle loading states and errors
 * 
 * @module hooks/use-ai-chat
 */

"use client"

import { useAIChat as useAIChatFromProvider } from "@/components/chat/ai-chat-provider"

/**
 * Custom hook for accessing AI Chat functionality
 * 
 * This exports the useAIChat hook from the provider, providing a consistent
 * way to access the AI Chat context throughout the application.
 * 
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { 
 *     messages, 
 *     sendMessage, 
 *     isLoading, 
 *     error 
 *   } = useAIChat();
 *   
 *   // Use the AI chat functionality
 * }
 * ```
 * 
 * @returns The AI Chat context with all state and methods
 * @throws Error if used outside of an AIChatProvider
 */
export const useAIChat = useAIChatFromProvider

// Export the hook as the default export for more flexibility
export default useAIChat 