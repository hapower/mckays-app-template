/**
 * Reference Extraction Server Actions
 * 
 * This module provides server actions for extracting references from AI responses,
 * saving them to the database, and managing citations. These actions are used to
 * process the citations extracted from AI responses and make them available for
 * display and management in the library.
 * 
 * Key functionality includes:
 * - Extracting references from message content
 * - Saving citations to the database
 * - Checking for duplicate citations
 * - Linking citations to messages
 * - Converting citations to library items
 * 
 * @module actions/reference-extraction-actions
 */

"use server"

import { db } from "@/db/db"
import { 
  extractCitations, 
  parseCitation, 
  convertToStructuredCitations 
} from "@/lib/citation-extractor"
import { ActionState } from "@/types"
import { Citation } from "@/types/chat-types"
import { 
  SelectMessage, 
  messagesTable 
} from "@/db/schema/messages-schema"
import { 
  InsertCitation, 
  SelectCitation, 
  citationsTable 
} from "@/db/schema/citations-schema"
import { 
  createReferenceAction 
} from "@/actions/db/references-actions"
import { and, eq, ilike } from "drizzle-orm"
import { sql } from "drizzle-orm/sql"

/**
 * Extract and save citations from a message
 * 
 * This action extracts citation information from a message's content,
 * saves the citations to the database, and associates them with the message.
 * 
 * @param messageId - The ID of the message to extract citations from
 * @returns ActionState with extracted citations or error message
 */
export async function extractAndSaveCitationsAction(
  messageId: string
): Promise<ActionState<Citation[]>> {
  try {
    // Get the message content
    const message = await db.query.messages.findFirst({
      where: eq(messagesTable.id, messageId)
    })
    
    if (!message) {
      return { 
        isSuccess: false, 
        message: "Message not found" 
      }
    }
    
    // Only extract citations from assistant messages
    if (message.role !== "assistant") {
      return {
        isSuccess: true,
        message: "No citations extracted from user message",
        data: []
      }
    }
    
    // Extract citations from the message content
    const { citations: rawCitations } = extractCitations(message.content)
    
    if (rawCitations.length === 0) {
      return {
        isSuccess: true,
        message: "No citations found in message",
        data: []
      }
    }
    
    // Convert raw citations to structured citation objects
    const structuredCitations = convertToStructuredCitations(rawCitations, messageId)
    
    // Save citations to the database
    const savedCitations = await saveCitationsToDatabase(structuredCitations)
    
    return {
      isSuccess: true,
      message: `${savedCitations.length} citations extracted and saved`,
      data: savedCitations
    }
  } catch (error) {
    console.error("Error extracting and saving citations:", error)
    return { 
      isSuccess: false, 
      message: "Failed to extract and save citations" 
    }
  }
}

/**
 * Save citation objects to the database
 * 
 * @param citations - Array of citation objects to save
 * @returns Array of saved citations with database IDs
 */
async function saveCitationsToDatabase(
  citations: Citation[]
): Promise<Citation[]> {
  if (!citations.length) return []
  
  const savedCitations: Citation[] = []
  
  // Process each citation individually to handle potential duplicates
  for (const citation of citations) {
    // Check if this citation already exists for this message
    const existingCitation = await db.query.citations.findFirst({
      where: and(
        eq(citationsTable.messageId, citation.messageId),
        eq(citationsTable.referenceNumber, citation.referenceNumber || 0)
      )
    })
    
    if (existingCitation) {
      // Citation already exists, use it
      savedCitations.push({
        ...existingCitation,
        createdAt: new Date(existingCitation.createdAt),
        updatedAt: new Date(existingCitation.updatedAt)
      } as Citation)
      continue
    }
    
    // Prepare citation data for insertion
    const citationData: InsertCitation = {
      messageId: citation.messageId,
      referenceNumber: citation.referenceNumber || 0,
      citationText: citation.title || "Unknown citation"
    }
    
    // Add optional metadata if available
    const metadata: Record<string, any> = {}
    
    if (citation.authors) metadata.authors = citation.authors
    if (citation.journal) metadata.journal = citation.journal
    if (citation.year) metadata.year = citation.year
    if (citation.doi) metadata.doi = citation.doi
    if (citation.url) metadata.url = citation.url
    
    // Only add metadata if we have some
    if (Object.keys(metadata).length > 0) {
      citationData.metadata = metadata
    }
    
    // Insert the citation into the database
    try {
      const [newCitation] = await db.insert(citationsTable)
        .values(citationData)
        .returning()
      
      if (newCitation) {
        // Convert database citation to Citation type
        savedCitations.push({
          id: newCitation.id,
          messageId: newCitation.messageId,
          title: citationData.citationText,
          authors: metadata.authors,
          journal: metadata.journal,
          year: metadata.year,
          doi: metadata.doi,
          url: metadata.url,
          referenceNumber: newCitation.referenceNumber,
          inLibrary: false,
          createdAt: new Date(newCitation.createdAt),
          updatedAt: new Date(newCitation.updatedAt)
        })
      }
    } catch (err) {
      console.error(`Error saving citation: ${err}`)
      // Continue with other citations even if one fails
    }
  }
  
  return savedCitations
}

/**
 * Get all citations for a message
 * 
 * @param messageId - The ID of the message
 * @returns ActionState with message citations or error message
 */
export async function getMessageCitationsAction(
  messageId: string
): Promise<ActionState<Citation[]>> {
  try {
    const citations = await db.query.citations.findMany({
      where: eq(citationsTable.messageId, messageId)
    })
    
    // Convert database citations to Citation type
    const formattedCitations: Citation[] = citations.map(citation => {
      const metadata = citation.metadata || {}
      
      return {
        id: citation.id,
        messageId: citation.messageId,
        title: citation.citationText,
        authors: metadata.authors,
        journal: metadata.journal,
        year: metadata.year,
        doi: metadata.doi,
        url: metadata.url,
        referenceNumber: citation.referenceNumber,
        inLibrary: false, // We'll set this based on library checks in the UI
        createdAt: new Date(citation.createdAt),
        updatedAt: new Date(citation.updatedAt)
      }
    })
    
    return {
      isSuccess: true,
      message: `${formattedCitations.length} citations retrieved`,
      data: formattedCitations
    }
  } catch (error) {
    console.error("Error getting message citations:", error)
    return { 
      isSuccess: false, 
      message: "Failed to get message citations" 
    }
  }
}

/**
 * Add a citation to the user's library
 * 
 * @param citationId - The ID of the citation to add
 * @param userId - The ID of the user
 * @returns ActionState with the created library reference or error message
 */
export async function addCitationToLibraryAction(
  citationId: string,
  userId: string
): Promise<ActionState<boolean>> {
  try {
    // Get the citation from the database
    const citation = await db.query.citations.findFirst({
      where: eq(citationsTable.id, citationId)
    })
    
    if (!citation) {
      return { 
        isSuccess: false, 
        message: "Citation not found" 
      }
    }
    
    // Extract metadata
    const metadata = citation.metadata || {}
    
    // Create a reference in the library
    const result = await createReferenceAction({
      userId,
      title: citation.citationText,
      content: citation.citationText,
      metadata: JSON.stringify(metadata)
    })
    
    if (result.isSuccess) {
      return {
        isSuccess: true,
        message: "Citation added to library",
        data: true
      }
    } else {
      return {
        isSuccess: false,
        message: result.message
      }
    }
  } catch (error) {
    console.error("Error adding citation to library:", error)
    return { 
      isSuccess: false, 
      message: "Failed to add citation to library" 
    }
  }
}

/**
 * Extract citations from all messages in a chat
 * 
 * @param chatId - The ID of the chat
 * @returns ActionState with the number of citations extracted
 */
export async function extractCitationsFromChatAction(
  chatId: string
): Promise<ActionState<number>> {
  try {
    // Get all assistant messages in the chat
    const messages = await db.query.messages.findMany({
      where: and(
        eq(messagesTable.chatId, chatId),
        eq(messagesTable.role, "assistant")
      )
    })
    
    if (messages.length === 0) {
      return {
        isSuccess: true,
        message: "No assistant messages found in chat",
        data: 0
      }
    }
    
    // Extract citations from each message
    let totalCitations = 0
    
    for (const message of messages) {
      const result = await extractAndSaveCitationsAction(message.id)
      if (result.isSuccess && result.data) {
        totalCitations += result.data.length
      }
    }
    
    return {
      isSuccess: true,
      message: `Extracted ${totalCitations} citations from ${messages.length} messages`,
      data: totalCitations
    }
  } catch (error) {
    console.error("Error extracting citations from chat:", error)
    return { 
      isSuccess: false, 
      message: "Failed to extract citations from chat" 
    }
  }
}

/**
 * Find similar citations in the database
 * This can be used to avoid duplicate citations and link related references
 * 
 * @param citation - The citation to find similar ones for
 * @returns ActionState with array of similar citations
 */
export async function findSimilarCitationsAction(
  citation: Partial<Citation>
): Promise<ActionState<SelectCitation[]>> {
  try {
    // We need at least a title to search for similar citations
    if (!citation.title) {
      return {
        isSuccess: false,
        message: "Citation title is required to find similar citations"
      }
    }
    
    // Build the query conditions
    const conditions = []
    
    // Title similarity (simple contains for now)
    conditions.push(ilike(citationsTable.citationText, `%${citation.title}%`))
    
    // Add additional filters if available
    if (citation.authors && citation.authors.length > 0) {
      conditions.push(
        sql`${citationsTable.metadata}->>'authors' ILIKE ${`%${citation.authors}%`}`
      )
    }
    
    if (citation.year) {
      conditions.push(
        sql`${citationsTable.metadata}->>'year' = ${citation.year}`
      )
    }
    
    if (citation.doi) {
      conditions.push(
        sql`${citationsTable.metadata}->>'doi' ILIKE ${`%${citation.doi}%`}`
      )
    }
    
    // Execute the query with all conditions
    const similarCitations = await db.query.citations.findMany({
      where: and(...conditions),
      limit: 10
    }) as SelectCitation[]
    
    return {
      isSuccess: true,
      message: `Found ${similarCitations.length} similar citations`,
      data: similarCitations
    }
  } catch (error) {
    console.error("Error finding similar citations:", error)
    return { 
      isSuccess: false, 
      message: "Failed to find similar citations" 
    }
  }
}

/**
 * Generate a citation text from a citation object
 * 
 * @param citation - The citation object
 * @returns ActionState with the formatted citation text
 */
export async function formatCitationTextAction(
  citation: Partial<Citation>
): Promise<ActionState<string>> {
  try {
    const parts: string[] = []
    
    // Authors
    if (citation.authors) {
      parts.push(citation.authors)
    }
    
    // Title
    if (citation.title) {
      parts.push(`"${citation.title}"`)
    }
    
    // Journal
    if (citation.journal) {
      parts.push(citation.journal)
    }
    
    // Year
    if (citation.year) {
      parts.push(citation.year)
    }
    
    // DOI
    if (citation.doi) {
      parts.push(`doi: ${citation.doi}`)
    }
    
    // URL
    if (citation.url && !citation.doi) {
      parts.push(`URL: ${citation.url}`)
    }
    
    // If no parts were added, use the citation title or a default message
    if (parts.length === 0) {
      return {
        isSuccess: true,
        message: "Generated default citation text",
        data: citation.title || "Unknown citation"
      }
    }
    
    // Join all parts with proper punctuation
    const formattedText = parts.join('. ')
    
    return {
      isSuccess: true,
      message: "Citation text formatted successfully",
      data: formattedText
    }
  } catch (error) {
    console.error("Error formatting citation text:", error)
    return { 
      isSuccess: false, 
      message: "Failed to format citation text" 
    }
  }
} 