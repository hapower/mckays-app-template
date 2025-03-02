/**
 * RAG (Retrieval Augmented Generation) Server Actions
 * 
 * This module provides server actions for interacting with the RAG system, which
 * enhances AI responses with relevant medical knowledge retrieved from the vector database.
 * 
 * The actions handle querying the vector store, processing results, and preparing data
 * for integration with AI responses. They serve as the bridge between the UI components
 * and the underlying RAG implementation.
 * 
 * @module actions/rag-actions
 */

"use server"

import { ActionState } from "@/types"
import { VectorSimilarityResult } from "@/db/schema/vector-store-schema"
import { queryRAG, enhanceRAGResults, RAGQueryParams } from "@/lib/rag-query"
import { sanitizeUserMessage, extractMedicalTerms } from "@/lib/prompt-utils"
import { revalidatePath } from "next/cache"

/**
 * Performs a RAG query to find relevant medical information
 * 
 * This action takes a query and optional parameters, performs a vector
 * similarity search, and returns medically relevant content to enhance 
 * AI responses.
 * 
 * @param query - The user's query or message
 * @param specialtyId - Optional ID of a medical specialty to focus the search
 * @param threshold - Minimum similarity threshold (default: 0.7)
 * @param limit - Maximum number of results to return (default: 5)
 * @returns ActionState with retrieved documents or error message
 */
export async function queryRAGAction(
  query: string,
  specialtyId?: string,
  threshold: number = 0.7,
  limit: number = 5
): Promise<ActionState<VectorSimilarityResult[]>> {
  try {
    // Sanitize input to prevent prompt injection
    const sanitizedQuery = sanitizeUserMessage(query)
    
    if (!sanitizedQuery.trim()) {
      return {
        isSuccess: false,
        message: "Query cannot be empty"
      }
    }
    
    // Prepare query parameters
    const queryParams: RAGQueryParams = {
      query: sanitizedQuery,
      threshold,
      limit
    }
    
    // Add specialty filter if provided
    if (specialtyId) {
      queryParams.specialtyId = specialtyId
    }
    
    // Execute the RAG query
    const result = await queryRAG(queryParams)
    
    if (result.error) {
      console.error("RAG query failed:", result.error)
      const errorMessage = result.error instanceof Error 
        ? result.error.message 
        : String(result.error)
      
      return {
        isSuccess: false,
        message: `Failed to retrieve relevant information: ${errorMessage}`
      }
    }
    
    // Enhance and prioritize results
    const enhancedResults = enhanceRAGResults(result.data || [], sanitizedQuery)
    
    return {
      isSuccess: true,
      message: `Retrieved ${enhancedResults.length} relevant documents`,
      data: enhancedResults
    }
  } catch (error) {
    console.error("Error in queryRAGAction:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `RAG query failed: ${error.message}` 
        : "An unexpected error occurred during RAG query"
    }
  }
}

/**
 * Performs a RAG query focused on specific medical terms extracted from a message
 * 
 * This action extracts medical terms from a user message and queries the RAG system
 * specifically for those terms, providing more targeted results.
 * 
 * @param message - The user's message to extract terms from
 * @param specialtyId - Optional ID of a medical specialty to focus the search
 * @returns ActionState with retrieved documents or error message
 */
export async function queryRAGWithTermExtractionAction(
  message: string,
  specialtyId?: string
): Promise<ActionState<VectorSimilarityResult[]>> {
  try {
    // Sanitize the input message
    const sanitizedMessage = sanitizeUserMessage(message)
    
    if (!sanitizedMessage.trim()) {
      return {
        isSuccess: false,
        message: "Message cannot be empty"
      }
    }
    
    // Extract medical terms from the message
    const medicalTerms = extractMedicalTerms(sanitizedMessage)
    
    // If no medical terms were found, perform a standard RAG query
    if (medicalTerms.length === 0) {
      return queryRAGAction(sanitizedMessage, specialtyId)
    }
    
    // Create a focused query from the extracted terms
    const focusedQuery = medicalTerms.join(" ")
    
    // Query both the original message and the focused query for better coverage
    const [messageResults, termResults] = await Promise.all([
      queryRAG({
        query: sanitizedMessage,
        specialtyId,
        threshold: 0.65,
        limit: 3
      }),
      queryRAG({
        query: focusedQuery,
        specialtyId,
        threshold: 0.7,
        limit: 3
      })
    ])
    
    // Handle errors
    if (messageResults.error && termResults.error) {
      return {
        isSuccess: false,
        message: "Failed to retrieve medical information for both queries"
      }
    }
    
    // Combine and deduplicate results
    const allResults = [
      ...(messageResults.data || []),
      ...(termResults.data || [])
    ]
    
    // Deduplicate by ID
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    )
    
    // Enhance and prioritize combined results
    const enhancedResults = enhanceRAGResults(uniqueResults, sanitizedMessage)
    
    return {
      isSuccess: true,
      message: `Retrieved ${enhancedResults.length} relevant medical documents`,
      data: enhancedResults
    }
  } catch (error) {
    console.error("Error in queryRAGWithTermExtractionAction:", error)
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Medical term extraction failed: ${error.message}` 
        : "An unexpected error occurred during term extraction"
    }
  }
}

/**
 * Revalidates cached RAG data for a specific path
 * 
 * This action clears any cached RAG results for a specific application path,
 * ensuring that future queries will use the most up-to-date data.
 * 
 * @param path - The application path to revalidate
 * @returns ActionState indicating success or failure
 */
export async function revalidateRAGCacheAction(
  path: string
): Promise<ActionState<void>> {
  try {
    // Revalidate the path
    revalidatePath(path)
    
    return {
      isSuccess: true,
      message: `RAG cache revalidated for path: ${path}`,
      data: undefined
    }
  } catch (error) {
    console.error("Error revalidating RAG cache:", error)
    return {
      isSuccess: false,
      message: "Failed to revalidate RAG cache"
    }
  }
}

/**
 * Provides debug information about the RAG system
 * 
 * This action returns metadata about the RAG system status, including
 * model information, available specialties, and system health metrics.
 * It's useful for development and debugging purposes.
 * 
 * @returns ActionState with RAG system diagnostic information
 */
export async function getRagDiagnosticsAction(): Promise<ActionState<Record<string, any>>> {
  try {
    // Query for a simple diagnostic check
    const testQuery = await queryRAG({
      query: "diagnostic test",
      limit: 1
    })
    
    // Prepare diagnostic information
    const diagnostics = {
      status: testQuery.error ? "error" : "operational",
      timestamp: new Date().toISOString(),
      model: {
        embedding: "text-embedding-3-small",
        embedding_dimensions: 1536
      },
      supabase: {
        connected: testQuery.error === null
      },
      error: testQuery.error ? String(testQuery.error) : null
    }
    
    if (diagnostics.status === "operational") {
      return {
        isSuccess: true,
        message: "RAG system is operational",
        data: diagnostics
      }
    } else {
      return {
        isSuccess: false,
        message: "RAG system is experiencing issues"
      }
    }
  } catch (error) {
    console.error("Error in getRagDiagnosticsAction:", error)
    return {
      isSuccess: false,
      message: "Failed to retrieve RAG diagnostics"
    }
  }
} 