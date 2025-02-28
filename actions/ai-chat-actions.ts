/**
 * AI Chat Processing Actions
 * 
 * This file implements server actions for processing chat messages with AI and RAG
 * (Retrieval Augmented Generation). It handles sending user messages to OpenAI,
 * enhancing prompts with relevant medical knowledge from the vector store,
 * and processing the AI responses including citation extraction.
 * 
 * The main action, processChatMessageAction, takes a user message and optional specialty,
 * retrieves relevant medical information using RAG, and returns an AI response
 * with extracted citations.
 * 
 * @module actions/ai-chat-actions
 */

"use server"

// Debug log to verify module loading
console.log("AI Chat Actions module loading...")

import { createChatAction, getChatByIdAction } from "@/actions/db/chats-actions"
import { createMessageAction } from "@/actions/db/messages-actions"
import { getSpecialtyByIdAction } from "@/actions/db/specialties-actions"
import { db, queryEmbeddings } from "@/db/db"
import { InsertChat } from "@/db/schema/chats-schema"
import { InsertMessage } from "@/db/schema/messages-schema"
import { ActionState } from "@/types"
import { ChatMessage, Citation } from "@/types/chat-types"
import { extractCitations, parseCitation } from "@/lib/utils"
import { generateEmbeddings, openai } from "@/lib/openai"

// Types for this module
interface ProcessMessageParams {
  message: string
  chatId?: string
  userId: string
  specialtyId?: string
}

interface AIResponse {
  message: ChatMessage
  citations?: Citation[]
}

/**
 * Convert embeddings from the database to a format suitable for the AI prompt
 * 
 * @param ragResults - Results from the vector database
 * @returns Formatted context string for the AI prompt
 */
function formatRAGResultsForPrompt(ragResults: any[]): string {
  if (!ragResults || ragResults.length === 0) {
    return ""
  }

  return ragResults
    .map((result, index) => {
      // Format the metadata as a citation
      const metadata = result.metadata || {}
      const citation = [
        metadata.title,
        metadata.authors,
        metadata.journal,
        metadata.year
      ]
        .filter(Boolean)
        .join(", ")

      // Return the formatted context entry
      return `[${index + 1}] ${result.content}\nCITATION: ${citation}`
    })
    .join("\n\n")
}

/**
 * Process a chat message with AI and RAG
 * 
 * This action takes a user message, retrieves relevant context using RAG,
 * sends the enhanced prompt to OpenAI, and returns the AI response with
 * extracted citations.
 * 
 * @param params - Parameters including message, chatId, userId, and specialtyId
 * @returns ActionState with the AI response and citations
 */
export async function processChatMessageAction(
  params: ProcessMessageParams
): Promise<ActionState<AIResponse>> {
  try {
    const { message, chatId, userId, specialtyId } = params

    // Get or create a chat session
    let currentChatId = chatId
    let specialtyName = "General Medicine" // Default specialty

    if (!currentChatId) {
      // Create a new chat session
      let chatData: InsertChat = {
        userId,
        title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        specialtyId
      }

      const chatResult = await createChatAction(chatData)
      if (!chatResult.isSuccess) {
        throw new Error("Failed to create chat session")
      }

      currentChatId = chatResult.data.id
    }

    // If specialty is provided, get its name for the prompt
    if (specialtyId) {
      const specialtyResult = await getSpecialtyByIdAction(specialtyId)
      if (specialtyResult.isSuccess && specialtyResult.data) {
        specialtyName = specialtyResult.data.name
      }
    }

    // Save the user message to the database
    const userMessageData: InsertMessage = {
      chatId: currentChatId,
      content: message,
      role: "user"
    }

    const saveUserMessageResult = await createMessageAction(userMessageData)
    if (!saveUserMessageResult.isSuccess) {
      throw new Error("Failed to save user message")
    }

    // Generate embeddings for the user query
    const queryEmbedding = await generateEmbeddings(message) as number[]

    // Retrieve relevant medical information using RAG
    let ragResults: any[] = []
    if (specialtyId) {
      const { data, error } = await queryEmbeddings(queryEmbedding, specialtyId, 0.7, 5)
      if (error) {
        console.error("Error querying embeddings:", error)
      } else if (data) {
        ragResults = data
      }
    }

    // Format the RAG results for the AI prompt
    const ragContext = formatRAGResultsForPrompt(ragResults)

    // Construct system prompt with specialty-specific instruction
    const systemPrompt = `You are an AI medical assistant specializing in ${specialtyName}. 
Provide accurate, evidence-based information to medical practitioners. 
Be concise yet thorough, use medical terminology appropriately, and cite your sources.
Always format citations as [n] at the end of sentences where n is a number.
At the end of your response, list all references in the format: [n] Author(s), Title, Journal, Year.

${ragContext ? `Use the following information to inform your response:\n\n${ragContext}` : ""}`;

    // Send the message to OpenAI with the enhanced prompt
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3,
      max_tokens: 2000
    })

    // Extract the AI response content
    const aiResponseContent = aiResponse.choices[0].message.content || ""

    // Extract citations from the AI response
    const { cleanText, citations } = extractCitations(aiResponseContent)

    // Process citations for better formatting
    const processedCitations = citations.map(citation => {
      const citationData = parseCitation(citation.text)
      return {
        id: `citation-${citation.referenceNumber}`,
        messageId: "",  // This will be set when actually saving to the database
        title: citationData.title || citation.text,
        authors: citationData.authors,
        journal: citationData.journal,
        year: citationData.year,
        doi: "",
        url: "",
        inLibrary: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        referenceNumber: citation.referenceNumber
      } as Citation
    })

    // Save the assistant message to the database
    const assistantMessageData: InsertMessage = {
      chatId: currentChatId,
      content: cleanText,
      role: "assistant"
    }

    const saveAssistantMessageResult = await createMessageAction(assistantMessageData)
    if (!saveAssistantMessageResult.isSuccess) {
      throw new Error("Failed to save assistant message")
    }

    // Return the processed result
    return {
      isSuccess: true,
      message: "Message processed successfully",
      data: {
        message: saveAssistantMessageResult.data,
        citations: processedCitations
      }
    }
  } catch (error) {
    console.error("Error processing chat message:", error)
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to process chat message" 
    }
  }
}

/**
 * Stream an AI response for a chat message
 * 
 * This function is similar to processChatMessageAction but designed for streaming
 * responses. It's currently a placeholder and would be implemented using 
 * server-sent events or a similar streaming mechanism.
 * 
 * @param params - Parameters including message, chatId, userId, and specialtyId
 * @returns A streaming response object
 */
export async function streamChatMessageAction(
  params: ProcessMessageParams
): Promise<ActionState<{ responseId: string }>> {
  try {
    // This is a simplified version that doesn't actually stream
    // In a real implementation, this would set up a streaming connection
    
    const result = await processChatMessageAction(params)
    
    if (!result.isSuccess) {
      throw new Error(result.message)
    }
    
    return {
      isSuccess: true,
      message: "Streaming started successfully",
      data: {
        responseId: result.data.message.id
      }
    }
  } catch (error) {
    console.error("Error streaming chat message:", error)
    return { 
      isSuccess: false, 
      message: error instanceof Error ? error.message : "Failed to stream chat message" 
    }
  }
}

/**
 * Generate a title for a chat based on its first message
 * 
 * This action takes a message and generates a concise, descriptive title
 * using AI.
 * 
 * @param message - The message to generate a title from
 * @returns ActionState with the generated title
 */
export async function generateChatTitleAction(
  message: string
): Promise<ActionState<string>> {
  try {
    const prompt = `Generate a short, descriptive title (5 words or less) for a medical chat that starts with this message: "${message}"`

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You generate concise, descriptive titles for medical chats." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 50
    })

    const title = aiResponse.choices[0].message.content?.trim() || "New Chat"

    return {
      isSuccess: true,
      message: "Title generated successfully",
      data: title
    }
  } catch (error) {
    console.error("Error generating chat title:", error)
    return { 
      isSuccess: false, 
      message: "Failed to generate title" 
    }
  }
} 