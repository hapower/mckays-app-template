/**
 * Prompt Utilities for AttendMe Medical Assistant
 *
 * This file provides utility functions for composing AI prompts dynamically.
 * It handles combining the base prompt with specialty-specific content,
 * incorporating RAG results, and formatting the final prompt for optimal
 * AI response quality.
 *
 * Key features:
 * - Dynamic prompt composition based on medical specialty
 * - RAG integration with retrieved medical information
 * - Prompt optimization including length management
 * - Citation handling for evidence-based responses
 *
 * @module lib/prompt-utils
 */

import {
  getBaseSystemPrompt,
  getFormattedBasePrompt,
  PromptFormattingOptions
} from "@/prompts/base-prompt"
import { getSpecialtyPromptText } from "@/prompts/specialty-prompts"

/**
 * Maximum recommended system prompt length to avoid token limitations
 */
const MAX_SYSTEM_PROMPT_LENGTH = 4000

/**
 * Maximum recommended RAG content length to avoid token limitations
 */
const MAX_RAG_CONTENT_LENGTH = 6000

/**
 * Interface for RAG result content to be incorporated into prompts
 */
export interface RAGContent {
  /**
   * The source text content retrieved from the RAG system
   */
  content: string

  /**
   * Metadata about the source, including title, authors, etc.
   */
  metadata?: {
    title?: string
    authors?: string
    journal?: string
    year?: string
    [key: string]: any
  }

  /**
   * Similarity score of the content to the query (0-1)
   */
  similarity?: number
}

/**
 * Options for composing a system prompt
 */
export interface PromptCompositionOptions extends PromptFormattingOptions {
  /**
   * The ID of the selected medical specialty
   */
  specialtyId?: string

  /**
   * Array of RAG content objects to incorporate into the prompt
   */
  ragContents?: RAGContent[]

  /**
   * Whether to include a preamble about the user being a medical professional
   */
  includeUserContext?: boolean
}

/**
 * Format RAG content for inclusion in a prompt
 *
 * @param ragContents - Array of RAG content objects
 * @param maxLength - Maximum length of the formatted content
 * @returns Formatted RAG content string
 */
export function formatRAGContent(
  ragContents: RAGContent[],
  maxLength: number = MAX_RAG_CONTENT_LENGTH
): string {
  if (!ragContents || ragContents.length === 0) {
    return ""
  }

  // Start with a header
  let formattedContent =
    "## RELEVANT MEDICAL INFORMATION\nUse the following information to inform your response:\n\n"

  // Format each RAG content item with citation information
  ragContents.forEach((item, index) => {
    // Format metadata for citation
    const metadata = item.metadata || {}
    const citation = [
      metadata.title,
      metadata.authors,
      metadata.journal,
      metadata.year
    ]
      .filter(Boolean)
      .join(", ")

    // Format the content with citation
    const contentWithCitation =
      `[${index + 1}] ${item.content}\n` +
      (citation ? `CITATION: ${citation}\n\n` : "\n")

    // Add to the formatted content if it doesn't exceed the max length
    if ((formattedContent + contentWithCitation).length <= maxLength) {
      formattedContent += contentWithCitation
    }
  })

  return formattedContent.trim()
}

/**
 * Compose a full system prompt for the AI medical assistant
 *
 * @param options - Options for prompt composition
 * @returns The composed system prompt
 */
export function composeSystemPrompt(
  options: PromptCompositionOptions = {}
): string {
  const {
    specialtyId,
    ragContents,
    includeUserContext = true,
    includeCitationInstructions = true,
    includeRagInstructions = true,
    maxLength = MAX_SYSTEM_PROMPT_LENGTH
  } = options

  // Start with the base prompt
  let systemPrompt = getFormattedBasePrompt({
    includeCitationInstructions,
    includeRagInstructions
  })

  // Add specialty-specific content if provided
  if (specialtyId) {
    const specialtyPrompt = getSpecialtyPromptText(specialtyId)
    if (specialtyPrompt) {
      systemPrompt += `\n\n${specialtyPrompt}`
    }
  }

  // Add user context if requested
  if (includeUserContext) {
    systemPrompt += `\n\n## USER CONTEXT\nYou are conversing with a medical professional who may have specific domain knowledge. Provide accurate, evidence-based information at an appropriate level of detail for someone with medical training.`
  }

  // Add RAG content if provided
  if (ragContents && ragContents.length > 0) {
    // Calculate how much space we have left for RAG content
    const availableSpace = maxLength - systemPrompt.length - 50 // 50 characters buffer

    if (availableSpace > 200) {
      // Only include RAG if we have enough space
      const formattedRAG = formatRAGContent(ragContents, availableSpace)
      systemPrompt += `\n\n${formattedRAG}`
    }
  }

  // Ensure we don't exceed the maximum length
  if (systemPrompt.length > maxLength) {
    systemPrompt = systemPrompt.substring(0, maxLength)

    // Try to find a clean breakpoint to cut at
    const lastNewlineIndex = systemPrompt.lastIndexOf("\n\n")
    if (lastNewlineIndex > maxLength * 0.8) {
      // Only cut at newline if it's reasonably far in
      systemPrompt = systemPrompt.substring(0, lastNewlineIndex)
    }
  }

  return systemPrompt.trim()
}

/**
 * Create a specialized medical prompt for a specific condition or topic
 *
 * @param topic - The medical topic or condition to focus on
 * @param specialtyId - Optional specialty ID to add context
 * @param ragContents - Optional RAG content to include
 * @returns A specialized system prompt focused on the topic
 */
export function createTopicSpecificPrompt(
  topic: string,
  specialtyId?: string,
  ragContents?: RAGContent[]
): string {
  // Get the base and specialty prompts
  const basePrompt = getBaseSystemPrompt()
  const specialtyPrompt = specialtyId ? getSpecialtyPromptText(specialtyId) : ""

  // Create a focused instruction for the topic
  const topicInstruction = `
## SPECIFIC TOPIC FOCUS
Focus your knowledge and response on the following medical topic: ${topic}.
Provide comprehensive, evidence-based information specifically about this topic.
Include relevant diagnostic criteria, management approaches, recent advances, and clinical pearls when applicable.
Organize your response to highlight the most clinically relevant information first.
`

  // Compose the full prompt
  return (
    composeSystemPrompt({
      specialtyId,
      ragContents,
      maxLength: MAX_SYSTEM_PROMPT_LENGTH,
      includeUserContext: true,
      includeCitationInstructions: true
    }) + `\n\n${topicInstruction}`
  )
}

/**
 * Create a prompt for handling a clinical case or patient scenario
 *
 * @param caseDetails - The clinical case details
 * @param specialtyId - Optional specialty ID to add context
 * @param ragContents - Optional RAG content to include
 * @returns A system prompt optimized for clinical case discussion
 */
export function createClinicalCasePrompt(
  caseDetails: string,
  specialtyId?: string,
  ragContents?: RAGContent[]
): string {
  // Clinical case specific instructions
  const caseInstruction = `
## CLINICAL CASE DISCUSSION
You are being presented with a clinical case scenario. Approach this as a clinical reasoning exercise.
Provide a structured assessment including:
1. Key clinical findings and their significance
2. Differential diagnosis with reasoning
3. Recommended diagnostic workup in order of priority
4. Initial management considerations
5. Key clinical pearls related to this presentation

Remember to use evidence-based approaches and cite relevant literature or guidelines when appropriate.
`

  // Compose the full prompt
  const basePrompt = composeSystemPrompt({
    specialtyId,
    ragContents,
    maxLength: MAX_SYSTEM_PROMPT_LENGTH - caseInstruction.length - 50, // Leave room for case instruction
    includeUserContext: true,
    includeCitationInstructions: true
  })

  return basePrompt + caseInstruction
}

/**
 * Sanitize and validate a user message before sending to the AI
 *
 * @param message - The user message to sanitize
 * @returns The sanitized message
 */
export function sanitizeUserMessage(message: string): string {
  if (!message) {
    return ""
  }

  // Remove any potential prompt injection attempts
  let sanitized = message
    .replace(
      /you are|you're an AI|ignore previous instructions|new instructions/gi,
      "[filtered]"
    )
    .trim()

  // Limit message length to a reasonable size
  const MAX_MESSAGE_LENGTH = 4000
  if (sanitized.length > MAX_MESSAGE_LENGTH) {
    sanitized =
      sanitized.substring(0, MAX_MESSAGE_LENGTH) + "... [message truncated]"
  }

  return sanitized
}

/**
 * Extract potential medical terms from a user message
 * This is useful for RAG retrieval enhancement
 *
 * @param message - The user message to analyze
 * @returns Array of extracted medical terms
 */
export function extractMedicalTerms(message: string): string[] {
  if (!message) {
    return []
  }

  // This is a simplified version. In a production system,
  // this would use a medical NER model or medical vocabulary lookup.
  const commonMedicalTerms = [
    "hypertension",
    "diabetes",
    "asthma",
    "copd",
    "cancer",
    "heart failure",
    "stroke",
    "arrhythmia",
    "pneumonia",
    "arthritis",
    "depression",
    "anxiety",
    "eczema",
    "hepatitis",
    "cirrhosis",
    "crohn",
    "colitis",
    "anemia",
    "hypothyroidism",
    "hyperthyroidism",
    "seizure",
    "epilepsy",
    "parkinson",
    "alzheimer",
    "migraine",
    "osteoporosis",
    "glaucoma",
    "cataract"
  ]

  const extractedTerms: string[] = []

  // Look for common medical terms
  const lowerMessage = message.toLowerCase()
  commonMedicalTerms.forEach(term => {
    if (lowerMessage.includes(term)) {
      extractedTerms.push(term)
    }
  })

  // Look for patterns like measurements, lab values, or medical abbreviations
  const patterns = [
    /\d+\s*mm?Hg/g, // Blood pressure
    /\d+\.\d+\s*mg\/d[lL]/g, // Lab values with units
    /\d+\s*mg/g, // Medication doses
    /\b[A-Z]{2,5}\b/g // Medical abbreviations
  ]

  patterns.forEach(pattern => {
    const matches = message.match(pattern)
    if (matches) {
      extractedTerms.push(...matches)
    }
  })

  // Return unique terms
  return [...new Set(extractedTerms)]
}

/**
 * Check if a specialty is relevant to a user query
 *
 * @param query - The user's query
 * @param specialtyId - The specialty ID to check relevance for
 * @returns Boolean indicating if the specialty is relevant
 */
export function isSpecialtyRelevantToQuery(
  query: string,
  specialtyId: string
): boolean {
  if (!query || !specialtyId) {
    return false
  }

  // Get the specialty prompt
  const specialtyPrompt = getSpecialtyPromptText(specialtyId)
  if (!specialtyPrompt) {
    return false
  }

  // Extract key terms from the specialty prompt
  const specialtyTerms = extractSpecialtyKeyTerms(specialtyPrompt)

  // Check if any of the specialty terms appear in the query
  const lowerQuery = query.toLowerCase()
  return specialtyTerms.some(term => lowerQuery.includes(term.toLowerCase()))
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

  // This is a simplified implementation. A more robust version would use
  // NLP techniques like term frequency-inverse document frequency (TF-IDF)
  // or keyword extraction algorithms.

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
