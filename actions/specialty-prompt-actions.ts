/**
 * Specialty Prompt Server Actions
 *
 * This module provides server actions for managing specialty-specific prompts
 * in the AttendMe application. It handles specialty selection, prompt generation,
 * and the integration of specialty knowledge into the AI system.
 *
 * These actions serve as the bridge between the UI components and the
 * specialty prompt injection utilities.
 *
 * @module actions/specialty-prompt-actions
 */

"use server"

import { getSpecialtyByIdAction } from "@/actions/db/specialties-actions"
import { updateChatSpecialtyAction } from "@/actions/db/chats-actions"
import { createSpecialtyPrompt, getCachedSpecialtyPrompt, createSpecialtyTransitionPrompt } from "@/lib/specialty-prompt-injection"
import { ActionState } from "@/types"
import { queryRAGWithTermExtractionAction } from "@/actions/rag-actions"
import { RAGContent } from "@/lib/prompt-utils"

/**
 * Response interface for specialty prompt actions
 */
interface SpecialtyPromptResponse {
  /**
   * The generated prompt text
   */
  prompt: string
  
  /**
   * Optional transition message when changing specialties
   */
  transitionMessage?: string
  
  /**
   * ID of the specialty
   */
  specialtyId: string
  
  /**
   * Name of the specialty for display
   */
  specialtyName: string
}

/**
 * Select a specialty and generate a specialized prompt
 *
 * This action handles the selection of a medical specialty, updates the chat's
 * specialty association, and generates a tailored prompt for the AI.
 *
 * @param specialtyId - The ID of the specialty to select
 * @param chatId - The ID of the current chat session
 * @param currentQuery - Optional current user query to enhance with RAG
 * @returns ActionState with the specialty prompt information
 */
export async function selectSpecialtyAction(
  specialtyId: string,
  chatId?: string,
  currentQuery?: string
): Promise<ActionState<SpecialtyPromptResponse>> {
  try {
    // Validate inputs
    if (!specialtyId) {
      return {
        isSuccess: false,
        message: "Specialty ID is required"
      }
    }

    // Get the specialty information
    const specialtyResult = await getSpecialtyByIdAction(specialtyId)
    
    if (!specialtyResult.isSuccess || !specialtyResult.data) {
      return {
        isSuccess: false,
        message: `Specialty not found: ${specialtyResult.message}`
      }
    }
    
    const specialty = specialtyResult.data

    // Update the chat with the selected specialty if a chat ID is provided
    if (chatId) {
      await updateChatSpecialtyAction(chatId, specialtyId)
    }

    // If we have a current query, enhance the prompt with RAG results
    let ragContents: RAGContent[] = []
    
    if (currentQuery) {
      const ragResults = await queryRAGWithTermExtractionAction(
        currentQuery,
        specialtyId
      )
      
      if (ragResults.isSuccess && ragResults.data) {
        ragContents = ragResults.data.map(result => ({
          content: result.content,
          metadata: result.metadata || {},
          similarity: result.similarity
        }))
      }
    }

    // Generate the specialty-specific prompt
    const prompt = createSpecialtyPrompt({
      specialty,
      ragContents,
      includeGeneralMedicalContext: true
    })

    return {
      isSuccess: true,
      message: `Specialty ${specialty.name} selected successfully`,
      data: {
        prompt,
        specialtyId: specialty.id,
        specialtyName: specialty.name
      }
    }
  } catch (error) {
    console.error("Error selecting specialty:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to select specialty: ${error.message}` 
        : "An unexpected error occurred while selecting specialty"
    }
  }
}

/**
 * Change the specialty of an existing chat
 *
 * This action handles changing the specialty of an ongoing conversation,
 * updating the chat record, and providing a transition prompt to acknowledge
 * the change.
 *
 * @param chatId - The ID of the chat to update
 * @param newSpecialtyId - The ID of the new specialty
 * @param currentSpecialtyId - The ID of the current specialty
 * @returns ActionState with the updated specialty information and transition prompt
 */
export async function changeSpecialtyAction(
  chatId: string,
  newSpecialtyId: string,
  currentSpecialtyId: string
): Promise<ActionState<SpecialtyPromptResponse>> {
  try {
    // Validate inputs
    if (!chatId || !newSpecialtyId) {
      return {
        isSuccess: false,
        message: "Chat ID and new specialty ID are required"
      }
    }

    // Update the chat's specialty
    const updateResult = await updateChatSpecialtyAction(chatId, newSpecialtyId)
    
    if (!updateResult.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to update chat specialty: ${updateResult.message}`
      }
    }

    // Get the new specialty information
    const specialtyResult = await getSpecialtyByIdAction(newSpecialtyId)
    
    if (!specialtyResult.isSuccess || !specialtyResult.data) {
      return {
        isSuccess: false,
        message: `New specialty not found: ${specialtyResult.message}`
      }
    }
    
    const specialty = specialtyResult.data

    // Generate the specialty-specific prompt
    const prompt = getCachedSpecialtyPrompt(newSpecialtyId)
    
    // Create a transition message if we're changing specialties
    const transitionMessage = currentSpecialtyId && currentSpecialtyId !== newSpecialtyId
      ? createSpecialtyTransitionPrompt(currentSpecialtyId, newSpecialtyId)
      : undefined

    return {
      isSuccess: true,
      message: `Chat specialty changed to ${specialty.name} successfully`,
      data: {
        prompt,
        transitionMessage,
        specialtyId: specialty.id,
        specialtyName: specialty.name
      }
    }
  } catch (error) {
    console.error("Error changing specialty:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to change specialty: ${error.message}` 
        : "An unexpected error occurred while changing specialty"
    }
  }
}

/**
 * Clear the specialty selection for a chat
 *
 * This action removes the specialty association from a chat,
 * returning the conversation to general medical context.
 *
 * @param chatId - The ID of the chat to update
 * @returns ActionState indicating success or failure
 */
export async function clearSpecialtyAction(
  chatId: string
): Promise<ActionState<void>> {
  try {
    // Validate input
    if (!chatId) {
      return {
        isSuccess: false,
        message: "Chat ID is required"
      }
    }

    // Update the chat to remove the specialty
    const updateResult = await updateChatSpecialtyAction(chatId, null)
    
    if (!updateResult.isSuccess) {
      return {
        isSuccess: false,
        message: `Failed to clear chat specialty: ${updateResult.message}`
      }
    }

    return {
      isSuccess: true,
      message: "Specialty cleared successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error clearing specialty:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to clear specialty: ${error.message}` 
        : "An unexpected error occurred while clearing specialty"
    }
  }
}

/**
 * Get a prompt for a specific specialty
 *
 * This action retrieves a specialty by ID and generates an appropriate
 * prompt for that specialty.
 *
 * @param specialtyId - The ID of the specialty
 * @returns ActionState with the specialty prompt
 */
export async function getSpecialtyPromptAction(
  specialtyId: string
): Promise<ActionState<string>> {
  try {
    // Validate input
    if (!specialtyId) {
      return {
        isSuccess: false,
        message: "Specialty ID is required"
      }
    }

    // Get the specialty
    const specialtyResult = await getSpecialtyByIdAction(specialtyId)
    
    if (!specialtyResult.isSuccess || !specialtyResult.data) {
      return {
        isSuccess: false,
        message: `Specialty not found: ${specialtyResult.message}`
      }
    }

    // Get the cached prompt
    const prompt = getCachedSpecialtyPrompt(specialtyId)

    return {
      isSuccess: true,
      message: "Specialty prompt retrieved successfully",
      data: prompt
    }
  } catch (error) {
    console.error("Error getting specialty prompt:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to get specialty prompt: ${error.message}` 
        : "An unexpected error occurred while getting specialty prompt"
    }
  }
} 