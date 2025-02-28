/*
<ai_context>
Utility functions for interacting with Supabase, particularly for vector operations
and file storage operations.
</ai_context>
*/

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client with client-side keys
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Function to generate OpenAI embeddings from text
export async function generateEmbedding(text: string) {
  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small"
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data[0].embedding
  } catch (error) {
    console.error("Error generating embedding:", error)
    throw error
  }
}

// Function to search for similar documents using embeddings
export async function searchDocuments(
  query: string,
  specialtyId: string,
  threshold: number = 0.5,
  limit: number = 5
) {
  try {
    // Generate embedding for query
    const embedding = await generateEmbedding(query)

    // Search for similar documents
    const { data, error } = await supabaseClient.rpc("match_documents", {
      query_embedding: embedding,
      specialty_filter: specialtyId,
      match_threshold: threshold,
      match_count: limit
    })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error searching documents:", error)
    throw error
  }
}

// Function to store a file in Supabase Storage
export async function uploadFile(bucket: string, filePath: string, file: File) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Function to get a public URL for a stored file
export function getPublicUrl(bucket: string, filePath: string) {
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(filePath)

  return data.publicUrl
}
