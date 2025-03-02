/**
 * Specialty Prompt Injection Utilities
 *
 * This module provides utilities for injecting specialty-specific content into AI prompts.
 * It handles the dynamic composition of prompts based on the selected medical specialty,
 * ensuring that AI responses are enhanced with domain-specific knowledge.
 *
 * Key features:
 * - Dynamic injection of specialty-specific prompt sections
 * - Caching of specialty prompts for performance
 * - Handling specialty transitions in ongoing conversations
 * - Composition of prompts with appropriate context and instructions
 *
 * @module lib/specialty-prompt-injection
 */

import { SelectSpecialty } from "@/db/schema"
import { getSpecialtyPromptText } from "@/prompts/specialty-prompts"
import {
  composeSystemPrompt,
  PromptCompositionOptions
} from "@/lib/prompt-utils"
import { RAGContent } from "@/lib/prompt-utils"

/**
 * Cache for specialty prompts to avoid redundant processing
 */
const specialtyPromptCache: Record<string, string> = {}

/**
 * Options for creating a specialty-specific prompt
 */
export interface SpecialtyPromptOptions {
  /**
   * The specialty object containing id, name, and other metadata
   */
  specialty: SelectSpecialty

  /**
   * Whether to include general medical context alongside specialty-specific content
   */
  includeGeneralMedicalContext?: boolean

  /**
   * RAG content to enhance the prompt with
   */
  ragContents?: RAGContent[]

  /**
   * Maximum length for the generated prompt
   */
  maxLength?: number

  /**
   * Whether to include citation instructions in the prompt
   */
  includeCitationInstructions?: boolean
}

/**
 * Creates a prompt specifically tailored for a medical specialty
 *
 * This function generates a prompt that incorporates specialty-specific knowledge
 * and context, optimizing the AI's responses for the selected medical domain.
 *
 * @param options - Configuration options for the specialty prompt
 * @returns A complete system prompt with specialty-specific knowledge
 */
export function createSpecialtyPrompt(options: SpecialtyPromptOptions): string {
  const {
    specialty,
    includeGeneralMedicalContext = true,
    ragContents = [],
    maxLength,
    includeCitationInstructions = true
  } = options

  // Build composition options from specialty information
  const compositionOptions: PromptCompositionOptions = {
    specialtyId: specialty.id,
    ragContents,
    includeUserContext: true,
    includeCitationInstructions,
    includeRagInstructions: true,
    maxLength
  }

  // Generate the full specialty-aware prompt
  return composeSystemPrompt(compositionOptions)
}

/**
 * Generates a specialty-specific prompt with caching
 *
 * This function generates a specialty-specific prompt and caches it for reuse,
 * improving performance for frequently used specialties.
 *
 * @param specialtyId - The ID of the specialty to generate a prompt for
 * @param ragContents - Optional RAG content to enhance the prompt
 * @returns A specialty-specific system prompt
 */
export function getCachedSpecialtyPrompt(
  specialtyId: string,
  ragContents: RAGContent[] = []
): string {
  // If no RAG content and we have a cached prompt, return it
  if (ragContents.length === 0 && specialtyPromptCache[specialtyId]) {
    return specialtyPromptCache[specialtyId]
  }

  // Generate the prompt
  const promptOptions: PromptCompositionOptions = {
    specialtyId,
    ragContents,
    includeUserContext: true,
    includeCitationInstructions: true
  }

  const prompt = composeSystemPrompt(promptOptions)

  // Cache the prompt if there's no RAG content (RAG content is query-specific)
  if (ragContents.length === 0) {
    specialtyPromptCache[specialtyId] = prompt
  }

  return prompt
}

/**
 * Adapts an existing conversation to a new specialty
 *
 * When a user switches specialties mid-conversation, this function generates
 * a transition prompt that acknowledges the specialty change and adjusts the
 * context appropriately.
 *
 * @param currentSpecialtyId - The ID of the current specialty
 * @param newSpecialtyId - The ID of the new specialty to transition to
 * @param conversationContext - Optional summary of the conversation so far
 * @returns A transition message for the AI to acknowledge the specialty change
 */
export function createSpecialtyTransitionPrompt(
  currentSpecialtyId: string,
  newSpecialtyId: string,
  conversationContext?: string
): string {
  // Get specialty prompts
  const currentSpecialtyPrompt = getSpecialtyPromptText(currentSpecialtyId)
  const newSpecialtyPrompt = getSpecialtyPromptText(newSpecialtyId)

  // If we don't have either specialty prompt, return a generic transition
  if (!currentSpecialtyPrompt || !newSpecialtyPrompt) {
    return "The specialty focus is being changed. Please adjust your responses accordingly."
  }

  // Create a thoughtful transition that acknowledges the change
  let transitionPrompt = `
I'm now transitioning from ${currentSpecialtyId} to ${newSpecialtyId} expertise.

${newSpecialtyPrompt}

Please acknowledge this change in specialty focus and continue the conversation with this new context.`

  // If we have conversation context, include it
  if (conversationContext) {
    transitionPrompt += `

The conversation so far has been about: ${conversationContext}

Please consider this history as you continue with the new specialty focus.`
  }

  return transitionPrompt
}

/**
 * Enhances a user query with specialty-specific context
 *
 * For certain medical queries, this function can add specialty-specific context
 * to help the AI better understand the domain-specific aspects of the question.
 *
 * @param query - The user's original query
 * @param specialtyId - The ID of the current specialty
 * @returns An enhanced query with specialty context
 */
export function enhanceQueryWithSpecialtyContext(
  query: string,
  specialtyId: string
): string {
  // If no specialty or query is empty, return the original query
  if (!specialtyId || !query.trim()) {
    return query
  }

  // Get the specialty prompt text
  const specialtyPrompt = getSpecialtyPromptText(specialtyId)

  // If no specialty prompt is found, return the original query
  if (!specialtyPrompt) {
    return query
  }

  // Extract key terms from the specialty to check relevance
  const specialtyTerms = extractSpecialtyKeyTerms(specialtyPrompt)
  const hasRelevantTerms = specialtyTerms.some(term =>
    query.toLowerCase().includes(term.toLowerCase())
  )

  // If the query already contains specialty-specific terms, don't modify it
  if (hasRelevantTerms) {
    return query
  }

  // Otherwise, enhance the query with specialty context
  return `${query}\n\nPlease consider this question in the context of ${specialtyId} medicine.`
}

/**
 * Extract key terms from a specialty prompt to identify its focus areas
 *
 * @param specialtyPrompt - The specialty prompt text
 * @returns Array of key terms from the specialty
 */
function extractSpecialtyKeyTerms(specialtyPrompt: string): string[] {
  if (!specialtyPrompt) {
    return []
  }

  // Extract terms that appear after bullet points or in emphasized sections
  const terms: string[] = []

  // Look for bullet points
  const bulletPointRegex = /- ([^:]+?)(?=\n|$)/g
  let match
  while ((match = bulletPointRegex.exec(specialtyPrompt)) !== null) {
    if (match[1] && match[1].length > 3) {
      // Ignore very short terms
      terms.push(match[1].trim())
    }
  }

  // Look for emphasized terms (in this case, terms that start with uppercase)
  const lines = specialtyPrompt.split("\n")
  lines.forEach(line => {
    const words = line.split(" ")
    words.forEach(word => {
      if (word.length > 3 && /^[A-Z][a-z]+$/.test(word)) {
        terms.push(word)
      }
    })
  })

  return [...new Set(terms)]
}
