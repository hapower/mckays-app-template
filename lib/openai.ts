/**
 * OpenAI API Utilities
 *
 * This file provides utility functions for interacting with the OpenAI API.
 * It abstracts the OpenAI client instantiation and provides helper functions
 * for common operations like chat completions and embeddings generation.
 *
 * The utilities include error handling, retry logic, and type definitions
 * for OpenAI API responses.
 *
 * @module lib/openai
 */

import OpenAI from "openai"

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/**
 * Options for chat completions
 */
interface ChatCompletionOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  stream?: boolean
}

/**
 * Message type for chat completions
 */
interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

/**
 * Generate a chat completion using OpenAI
 *
 * @param messages - Array of messages to send to OpenAI
 * @param options - Configuration options for the completion
 * @returns The AI-generated response text
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  try {
    const {
      model = "gpt-4-turbo",
      temperature = 0.7,
      maxTokens = 2000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0,
      stream = false
    } = options

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream
    })

    // If streaming is enabled, this will handle differently
    if (stream) {
      throw new Error("Streaming is not implemented in this utility function")
    }

    // Return the content of the first choice
    if ("choices" in response) {
      return response.choices[0].message.content || ""
    }

    return ""
  } catch (error) {
    console.error("Error generating chat completion:", error)
    throw new Error(
      `Failed to generate chat completion: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Generate embeddings for a text or array of texts
 *
 * @param input - Text or array of texts to generate embeddings for
 * @param model - Embedding model to use
 * @returns Array of embeddings
 */
export async function generateEmbeddings(
  input: string | string[],
  model: string = "text-embedding-3-small"
): Promise<number[][] | number[]> {
  try {
    const response = await openai.embeddings.create({
      model,
      input
    })

    // If input is a string, return the single embedding
    if (typeof input === "string") {
      return response.data[0].embedding
    }

    // Otherwise, return all embeddings
    return response.data.map(item => item.embedding)
  } catch (error) {
    console.error("Error generating embeddings:", error)
    throw new Error(
      `Failed to generate embeddings: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Stream a chat completion from OpenAI
 *
 * This function is used for streaming chat completions and is designed to be
 * used with a streaming-compatible framework or client.
 *
 * @param messages - Array of messages to send to OpenAI
 * @param options - Configuration options for the completion
 * @returns An async generator that yields completion chunks
 */
export async function* streamChatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): AsyncGenerator<string, void, unknown> {
  try {
    const {
      model = "gpt-4-turbo",
      temperature = 0.7,
      maxTokens = 2000,
      topP = 1,
      frequencyPenalty = 0,
      presencePenalty = 0
    } = options

    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stream: true
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || ""
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error("Error streaming chat completion:", error)
    throw new Error(
      `Failed to stream chat completion: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

/**
 * Generate a moderation result for a text
 *
 * This function checks if the input text violates OpenAI's content policy.
 *
 * @param input - Text to check
 * @returns Whether the text was flagged by the moderation API
 */
export async function moderateContent(input: string): Promise<boolean> {
  try {
    const response = await openai.moderations.create({
      input
    })

    // Check if the text was flagged
    return response.results[0].flagged
  } catch (error) {
    console.error("Error moderating content:", error)
    // Default to flagged in case of error, for safety
    return true
  }
}

// Export the OpenAI client for direct use when needed
export { openai }
