/*
<ai_context>
Contains the utility functions for the app.
</ai_context>
*/

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string (e.g., "January 1, 2025")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

/**
 * Format a date and time to a readable string (e.g., "January 1, 2025, 12:00 PM")
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  })
}

/**
 * Truncate text to a maximum length and add ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Parse a citation text into structured data
 * Example: "Smith J, et al. Recent advances in cardiology. Journal of Cardiology, 2023"
 */
export function parseCitation(citationText: string): Record<string, string> {
  // Simple parsing for common citation formats
  const parts = citationText.split(". ")

  const result: Record<string, string> = {}

  // Basic parsing for "Author. Title. Journal. Year" format
  if (parts.length >= 3) {
    result.authors = parts[0]
    result.title = parts[1]

    const journalYearMatch = parts[2].match(/(.+?)(?:,\s*(\d{4}))?/)
    if (journalYearMatch) {
      result.journal = journalYearMatch[1]
      if (journalYearMatch[2]) {
        result.year = journalYearMatch[2]
      }
    }
  } else {
    // Fallback
    result.text = citationText
  }

  return result
}

/**
 * Extract citations from an AI response text
 * Finds all [n] reference markers and their corresponding citation text
 */
export function extractCitations(text: string): {
  cleanText: string
  citations: Array<{
    referenceNumber: number
    text: string
  }>
} {
  const citations: Array<{ referenceNumber: number; text: string }> = []
  const citationPattern = /\[(\d+)\]\s*([^\[\]]+)(?=\[\d+\]|$)/g

  // Find all citations and extract them
  let match
  while ((match = citationPattern.exec(text)) !== null) {
    citations.push({
      referenceNumber: parseInt(match[1], 10),
      text: match[2].trim()
    })
  }

  // Remove citation texts from the end of the response
  let cleanText = text
  citations.forEach(citation => {
    cleanText = cleanText.replace(
      `[${citation.referenceNumber}] ${citation.text}`,
      ""
    )
  })

  // Clean up any remaining reference numbers
  cleanText = cleanText.replace(/\[(\d+)\]/g, (match, refNum) => {
    // Keep the reference numbers that were found in the citations
    if (citations.some(c => c.referenceNumber === parseInt(refNum, 10))) {
      return match
    }
    return ""
  })

  // Trim extra whitespace and newlines
  cleanText = cleanText.trim()

  return { cleanText, citations }
}

/**
 * Generate a random ID (useful for temporary IDs before DB insertion)
 */
export function generateId(prefix = ""): string {
  return `${prefix}${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Debounce function for search inputs and other frequently-firing events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if an object is empty
 */
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0
}

/**
 * Filter unique items in an array
 */
export function uniqueItems<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Filter unique objects in an array by a key
 */
export function uniqueObjectsByKey<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set<string>()
  return array.filter(item => {
    const value = String(item[key])
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}
