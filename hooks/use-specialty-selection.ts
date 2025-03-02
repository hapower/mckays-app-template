/**
 * Specialty Selection Custom Hook
 *
 * This hook provides functionality for selecting medical specialties in the application.
 * It manages the state of selected specialties and handles the integration with the AI chat
 * system to update context and prompts when a specialty is selected.
 *
 * The hook provides methods for selecting specialties, clearing selections, and getting
 * information about the currently selected specialty, while abstracting away the complex
 * interactions with the AI chat system and specialty prompt actions.
 *
 * @module hooks/use-specialty-selection
 */

"use client"

import { useState, useCallback } from "react"
import { useAIChat } from "@/hooks/use-ai-chat"
import { useToast } from "@/hooks/use-toast"
import { SelectSpecialty } from "@/db/schema"
import { 
  selectSpecialtyAction, 
  changeSpecialtyAction, 
  clearSpecialtyAction 
} from "@/actions/specialty-prompt-actions"

/**
 * Interface for the return value of the useSpecialtySelection hook
 */
interface UseSpecialtySelectionReturn {
  /**
   * The ID of the currently selected specialty (if any)
   */
  selectedSpecialtyId: string | null
  
  /**
   * The name of the currently selected specialty (if any)
   */
  selectedSpecialtyName: string | null
  
  /**
   * Whether the specialty selection is currently loading
   */
  isLoading: boolean
  
  /**
   * Error message if specialty selection fails
   */
  error: string | null
  
  /**
   * Select a specialty and update the AI chat context
   */
  selectSpecialty: (specialty: SelectSpecialty) => Promise<void>
  
  /**
   * Clear the currently selected specialty
   */
  clearSpecialty: () => Promise<void>
}

/**
 * Custom hook for handling specialty selection
 * 
 * This hook integrates with the AI chat context to update prompts and
 * context when a specialty is selected or cleared.
 * 
 * @returns An object containing specialty selection state and methods
 */
export function useSpecialtySelection(): UseSpecialtySelectionReturn {
  // Get access to AI chat context
  const { 
    currentSpecialty,
    selectSpecialty: selectSpecialtyInContext,
    clearSpecialty: clearSpecialtyInContext,
    chatId
  } = useAIChat()
  
  // Toast notifications
  const { toast } = useToast()
  
  // Local state for loading and error handling
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Select a specialty and update the AI chat context
   * 
   * @param specialty - The specialty to select
   */
  const selectSpecialty = useCallback(async (specialty: SelectSpecialty) => {
    try {
      setIsLoading(true)
      setError(null)

      // If there's no current chat, just update the context directly
      if (!chatId) {
        await selectSpecialtyInContext(specialty)
        return
      }

      // For an existing chat, change the specialty through the server action
      const result = await changeSpecialtyAction(
        chatId,
        specialty.id,
        currentSpecialty.id || ""
      )

      if (!result.isSuccess) {
        throw new Error(result.message)
      }

      // Update the UI context with the new specialty
      await selectSpecialtyInContext(specialty)
      
      // Show success notification
      toast({
        title: "Specialty Changed",
        description: `Changed to ${specialty.name} specialty`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to select specialty"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [chatId, currentSpecialty.id, selectSpecialtyInContext, toast])

  /**
   * Clear the currently selected specialty
   */
  const clearSpecialty = useCallback(async () => {
    try {
      if (!currentSpecialty.id) return
      
      setIsLoading(true)
      setError(null)

      // If there's no current chat, just update the context directly
      if (!chatId) {
        await clearSpecialtyInContext()
        return
      }

      // For an existing chat, clear the specialty through the server action
      const result = await clearSpecialtyAction(chatId)

      if (!result.isSuccess) {
        throw new Error(result.message)
      }

      // Update the UI context
      await clearSpecialtyInContext()
      
      // Show success notification
      toast({
        title: "Specialty Cleared",
        description: "Returned to general medical mode",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to clear specialty"
      setError(errorMessage)
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [chatId, currentSpecialty.id, clearSpecialtyInContext, toast])

  return {
    selectedSpecialtyId: currentSpecialty.id,
    selectedSpecialtyName: currentSpecialty.name,
    isLoading,
    error,
    selectSpecialty,
    clearSpecialty
  }
}

export default useSpecialtySelection 