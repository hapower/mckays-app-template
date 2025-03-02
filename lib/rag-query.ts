/**
 * RAG Query Utilities
 *
 * This module provides utilities for implementing the Retrieval Augmented Generation (RAG)
 * system in the AttendMe application. It handles vector similarity searches against the
 * medical knowledge database to find relevant information for enhancing AI responses.
 *
 * The utilities abstract the complexity of vector operations and Supabase interactions,
 * providing a clean interface for semantic similarity search using embeddings.
 *
 * @module lib/rag-query
 */

import { supabase } from "@/db/db"
import { generateEmbeddings } from "@/lib/openai"
import { VectorSimilarityResult } from "@/db/schema/vector-store-schema"

/**
 * Interface for RAG query parameters
 */
export interface RAGQueryParams {
  /**
   * The text query to search for similar content
   */
  query: string

  /**
   * Optional ID of a medical specialty to filter results by
   */
  specialtyId?: string

  /**
   * Minimum similarity threshold (0-1) for results (default: 0.7)
   */
  threshold?: number

  /**
   * Maximum number of results to return (default: 5)
   */
  limit?: number
}

/**
 * Interface for successful RAG query response
 */
export interface RAGQuerySuccess {
  /**
   * Array of similar documents with content and metadata
   */
  data: VectorSimilarityResult[]

  /**
   * Error is null for successful responses
   */
  error: null
}

/**
 * Interface for failed RAG query response
 */
export interface RAGQueryError {
  /**
   * Data is null for error responses
   */
  data: null

  /**
   * Error message or object
   */
  error: Error | string
}

/**
 * Union type for RAG query responses
 */
export type RAGQueryResponse = RAGQuerySuccess | RAGQueryError

/**
 * Query the vector database for semantically similar medical information
 *
 * This function takes a text query, generates an embedding vector, and
 * performs a similarity search against the medical embeddings database.
 * It returns documents most relevant to the query, optionally filtered
 * by medical specialty.
 *
 * @param params - Query parameters including the search text and optional filters
 * @returns A promise resolving to either results or an error
 *
 * @example
 * const result = await queryRAG({
 *   query: "What are the latest treatments for heart failure?",
 *   specialtyId: "cardiology-id",
 *   threshold: 0.75,
 *   limit: 3
 * });
 */
export async function queryRAG(
  params: RAGQueryParams
): Promise<RAGQueryResponse> {
  try {
    const { query, specialtyId, threshold = 0.7, limit = 5 } = params

    // Generate embedding vector for the query text
    const queryEmbedding = await generateEmbeddings(query)

    if (!queryEmbedding || !Array.isArray(queryEmbedding)) {
      throw new Error("Failed to generate query embedding")
    }

    // Call the match_documents function in Supabase
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      specialty_filter: specialtyId || null
    })

    if (error) {
      console.error("Error in vector search:", error)
      throw error
    }

    // Parse and format the results
    const formattedResults: VectorSimilarityResult[] = data.map(
      (item: any) => ({
        id: item.id,
        content: item.content,
        metadata: item.metadata || {},
        similarity: item.similarity
      })
    )

    return {
      data: formattedResults,
      error: null
    }
  } catch (error) {
    console.error("RAG query error:", error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error))
    }
  }
}

/**
 * Check if the RAG system is available by performing a simple query
 *
 * This function attempts a basic vector search to verify that the
 * RAG system is properly configured and operational.
 *
 * @returns A promise resolving to true if operational, false otherwise
 */
export async function checkRAGAvailability(): Promise<boolean> {
  try {
    // Perform a simple test query
    const testResult = await queryRAG({
      query: "test query",
      limit: 1
    })

    // If we get a response (even empty) without errors, the system is working
    return testResult.error === null
  } catch (error) {
    console.error("RAG availability check failed:", error)
    return false
  }
}

/**
 * Filter and rank RAG results based on relevance to the query
 *
 * This function provides additional filtering and ranking beyond
 * the vector similarity search, applying heuristics to improve
 * result quality.
 *
 * @param results - Initial RAG query results
 * @param query - The original query text
 * @returns Filtered and re-ranked results
 */
export function enhanceRAGResults(
  results: VectorSimilarityResult[],
  query: string
): VectorSimilarityResult[] {
  if (!results || results.length === 0) {
    return []
  }

  // Convert query to lowercase for case-insensitive matching
  const lowerQuery = query.toLowerCase()

  // Extract key terms from the query
  const queryTerms = lowerQuery
    .split(/\s+/)
    .filter(term => term.length > 3) // Only consider meaningful terms
    .map(term => term.replace(/[^\w]/g, "")) // Remove non-word characters

  // Score each result based on term frequency and other heuristics
  const scoredResults = results.map(result => {
    const lowerContent = result.content.toLowerCase()

    // Calculate base score from similarity
    let score = result.similarity

    // Boost score based on exact phrase matches
    if (lowerContent.includes(lowerQuery)) {
      score += 0.2
    }

    // Boost score based on term frequency
    queryTerms.forEach(term => {
      if (lowerContent.includes(term)) {
        score += 0.05
      }
    })

    // Boost recent publications if timestamp is available
    if (result.metadata?.year) {
      const year = parseInt(result.metadata.year)
      const currentYear = new Date().getFullYear()
      if (year >= currentYear - 2) {
        // Published in last 2 years
        score += 0.1
      }
    }

    return {
      ...result,
      enhancedScore: Math.min(score, 1) // Cap score at 1.0
    }
  })

  // Sort by enhanced score and return top results
  return scoredResults
    .sort((a, b) => (b.enhancedScore || 0) - (a.enhancedScore || 0))
    .map(({ enhancedScore, ...result }) => result) // Remove the temporary score
}
