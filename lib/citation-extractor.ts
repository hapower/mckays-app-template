/**
 * Citation Extraction Utilities
 *
 * This module provides utility functions for extracting and parsing citations
 * from AI-generated responses. It supports detection of citation markers in text,
 * extraction of full citation texts, and parsing citations into structured data
 * that can be stored in the database and displayed in the UI.
 *
 * The module handles various citation formats commonly used in medical literature
 * and provides robust error handling for incomplete or malformed citations.
 *
 * @module lib/citation-extractor
 */

import { Citation } from "@/types/chat-types"
import { generateId } from "@/lib/utils"

/**
 * Interface for raw citation data extracted from text
 */
export interface RawCitation {
  /**
   * Reference number in the text (e.g., 1, 2, 3)
   */
  referenceNumber: number

  /**
   * Raw citation text extracted from the response
   */
  text: string

  /**
   * Positions where this citation is referenced in the text
   */
  positions: number[]
}

/**
 * Interface for parsed citation data with structured fields
 */
export interface ParsedCitation {
  /**
   * Title of the referenced work
   */
  title: string

  /**
   * Authors of the referenced work
   */
  authors?: string

  /**
   * Journal or publication name
   */
  journal?: string

  /**
   * Publication year
   */
  year?: string

  /**
   * Digital Object Identifier
   */
  doi?: string

  /**
   * URL to the referenced work
   */
  url?: string

  /**
   * Any additional information
   */
  additionalInfo?: string
}

/**
 * Regular expression patterns for different citation formats
 */
const CITATION_PATTERNS = {
  // Standard format: Author(s), Title, Journal, Year
  standard:
    /^((?:[^,.]+(?:,|, and| et al\.|, et al\.))+)\s*[,.]\s*(.+?)[,.]?\s*(?:(?:in|published in)\s+)?([^,.]+?)[,.]?\s*(?:\(?(\d{4})\)?)?(?:[,.]\s*(?:doi:)?\s*((?:https?:\/\/)?(?:dx\.)?doi\.org\/[^\s]+))?$/i,

  // Journal abbreviation format: Author(s), "Title," J. Abbr., Year
  abbreviated:
    /^((?:[^,.]+(?:,|, and| et al\.|, et al\.))+)\s*[,.]\s*(?:"|")(.*?)(?:"|")[,.]\s*([A-Za-z\s\.]+\.)[,.]\s*(?:\(?(\d{4})\)?)/i,

  // Title-first format: "Title," Author(s), Journal, Year
  titleFirst:
    /^(?:"|")(.*?)(?:"|")[,.]\s*((?:[^,.]+(?:,|, and| et al\.|, et al\.))+)[,.]\s*([^,.]+?)[,.]\s*(?:\(?(\d{4})\)?)/i,

  // DOI format: Various formats with DOI
  doi: /doi:?\s*(10\.\d{4,}\/[^\s,.\]]+)/i,

  // URL format: Various formats with URL
  url: /(https?:\/\/[^\s,.\]]+)/i
}

/**
 * Extract all citations from an AI-generated text response
 *
 * This function identifies citation markers like [1], [2], etc. in the text,
 * extracts the full citation texts typically found at the end of the response,
 * and associates the citations with their reference numbers.
 *
 * @param text - The full text response from the AI
 * @returns An object containing the cleaned text and extracted citations
 */
export function extractCitations(text: string): {
  cleanText: string
  citations: RawCitation[]
} {
  // If text is empty or not a string, return empty result
  if (!text || typeof text !== "string") {
    return { cleanText: text || "", citations: [] }
  }

  const citations: RawCitation[] = []

  // Find all citation markers [n] in the text and their positions
  const markerPositions: Record<number, number[]> = {}
  const markerRegex = /\[(\d+)\]/g
  let match

  // Store all positions where each citation number appears
  while ((match = markerRegex.exec(text)) !== null) {
    const referenceNumber = parseInt(match[1], 10)
    if (!markerPositions[referenceNumber]) {
      markerPositions[referenceNumber] = []
    }
    markerPositions[referenceNumber].push(match.index)
  }

  // Extract citation texts from the end of the response
  let remainingText = text
  const referenceSection = findReferenceSection(text)

  if (referenceSection) {
    // Extract individual citation entries from the reference section
    const citationEntries = extractCitationEntries(referenceSection)

    // Process each citation entry
    citationEntries.forEach(entry => {
      const { referenceNumber, citationText } = parseCitationEntry(entry)

      if (referenceNumber && citationText) {
        citations.push({
          referenceNumber,
          text: citationText.trim(),
          positions: markerPositions[referenceNumber] || []
        })
      }
    })

    // Remove the reference section from the text
    remainingText = text.replace(referenceSection, "").trim()
  } else {
    // If no reference section is found, try to extract citations inline
    // This is a fallback for when citations are not in a dedicated section
    const referenceNumbers = Object.keys(markerPositions).map(Number)

    for (const refNum of referenceNumbers) {
      // Look for patterns like [n] Citation text
      const inlineCitationRegex = new RegExp(
        `\\[${refNum}\\]\\s*([^\\[\\]]+?)(?=\\s*\\[\\d+\\]|$)`,
        "g"
      )
      const inlineMatch = inlineCitationRegex.exec(text)

      if (inlineMatch) {
        citations.push({
          referenceNumber: refNum,
          text: inlineMatch[1].trim(),
          positions: markerPositions[refNum] || []
        })
      }
    }
  }

  // Sort citations by reference number
  citations.sort((a, b) => a.referenceNumber - b.referenceNumber)

  return {
    cleanText: remainingText,
    citations
  }
}

/**
 * Find the reference section at the end of an AI response
 *
 * This function identifies the section containing the full citations,
 * typically found at the end of the response and often preceded by
 * headings like "References:", "Citations:", etc.
 *
 * @param text - The full text response
 * @returns The reference section text or null if not found
 */
function findReferenceSection(text: string): string | null {
  // Common reference section header patterns
  const referenceHeaderPatterns = [
    /references?:?\s*$/im,
    /citations?:?\s*$/im,
    /sources?:?\s*$/im,
    /bibliography:?\s*$/im
  ]

  // Check if there's a reference section header
  let sectionStartIndex = -1

  for (const pattern of referenceHeaderPatterns) {
    const match = pattern.exec(text)
    if (match) {
      sectionStartIndex = match.index
      break
    }
  }

  // If no standard header is found, look for typical citation patterns
  if (sectionStartIndex === -1) {
    // Look for a pattern of [1] Citation text
    const citationPattern = /\[\d+\]\s+[A-Z][^[]+?(?=\[\d+\]|$)/g
    let citationMatches = [...text.matchAll(citationPattern)]

    // If we found multiple citation patterns and the last one is near the end of the text
    if (citationMatches.length > 0) {
      const firstMatchIndex = citationMatches[0].index || 0
      const lastParagraphIndex = text.lastIndexOf("\n\n", firstMatchIndex)

      if (lastParagraphIndex !== -1) {
        sectionStartIndex = lastParagraphIndex + 2 // Skip the newlines
      } else {
        sectionStartIndex = firstMatchIndex
      }
    }
  }

  // If we found a section, return it
  if (sectionStartIndex !== -1) {
    return text.substring(sectionStartIndex).trim()
  }

  return null
}

/**
 * Extract individual citation entries from the reference section
 *
 * @param referenceSection - The text of the reference section
 * @returns Array of individual citation entries
 */
function extractCitationEntries(referenceSection: string): string[] {
  // Split by citation number pattern [n]
  const entries = referenceSection.split(/\n+(?=\[\d+\])/)

  // Filter out any empty entries or headers
  return entries
    .filter(entry => {
      const trimmedEntry = entry.trim()
      // Check if the entry looks like a citation (has [n] pattern and content)
      return /^\[\d+\]/.test(trimmedEntry) && trimmedEntry.length > 4
    })
    .map(entry => entry.trim())
}

/**
 * Parse a citation entry to extract reference number and citation text
 *
 * @param entry - A single citation entry text
 * @returns Object with referenceNumber and citationText
 */
function parseCitationEntry(entry: string): {
  referenceNumber: number | null
  citationText: string | null
} {
  // Extract reference number [n]
  const refNumberMatch = entry.match(/^\[(\d+)\]/)
  if (!refNumberMatch) {
    return { referenceNumber: null, citationText: null }
  }

  const referenceNumber = parseInt(refNumberMatch[1], 10)
  const citationText = entry.replace(/^\[\d+\]\s*/, "").trim()

  return {
    referenceNumber,
    citationText: citationText || null
  }
}

/**
 * Parse a citation string into structured data
 *
 * This function takes a raw citation string and attempts to extract
 * structured information such as authors, title, journal, year, etc.
 * It supports various citation formats common in medical literature.
 *
 * @param citationText - The raw citation text to parse
 * @returns Structured citation data
 */
export function parseCitation(citationText: string): ParsedCitation {
  // Handle empty input
  if (!citationText) {
    return { title: "Unknown source" }
  }

  // Initialize with minimal structure
  const result: ParsedCitation = {
    title: citationText // Default to using the full citation as title if parsing fails
  }

  // Try to extract DOI if present
  const doiMatch = CITATION_PATTERNS.doi.exec(citationText)
  if (doiMatch) {
    result.doi = doiMatch[1]
  }

  // Try to extract URL if present
  const urlMatch = CITATION_PATTERNS.url.exec(citationText)
  if (urlMatch) {
    result.url = urlMatch[1]
  }

  // Try standard format first
  const standardMatch = CITATION_PATTERNS.standard.exec(citationText)
  if (standardMatch) {
    result.authors = standardMatch[1].trim()
    result.title = standardMatch[2].trim()
    result.journal = standardMatch[3].trim()
    result.year = standardMatch[4]
    return result
  }

  // Try abbreviated format
  const abbreviatedMatch = CITATION_PATTERNS.abbreviated.exec(citationText)
  if (abbreviatedMatch) {
    result.authors = abbreviatedMatch[1].trim()
    result.title = abbreviatedMatch[2].trim()
    result.journal = abbreviatedMatch[3].trim()
    result.year = abbreviatedMatch[4]
    return result
  }

  // Try title-first format
  const titleFirstMatch = CITATION_PATTERNS.titleFirst.exec(citationText)
  if (titleFirstMatch) {
    result.title = titleFirstMatch[1].trim()
    result.authors = titleFirstMatch[2].trim()
    result.journal = titleFirstMatch[3].trim()
    result.year = titleFirstMatch[4]
    return result
  }

  // If no structured format matches, try simple splitting by commas or periods
  const parts = citationText.split(/[,.]\s+/)
  if (parts.length >= 3) {
    // Assume first part is authors, second is title, third is journal
    result.authors = parts[0].trim()
    result.title = parts[1].trim()

    // Try to identify the journal part and year
    for (let i = 2; i < parts.length; i++) {
      const part = parts[i].trim()

      // Check if this part looks like it contains a year
      const yearMatch = part.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        result.year = yearMatch[0]

        // If this part has more than just the year, it might be the journal + year
        if (part.length > 4) {
          result.journal = part.replace(yearMatch[0], "").trim()
        }
        // If journal is not yet assigned, check the previous part
        else if (!result.journal && i > 2) {
          result.journal = parts[i - 1].trim()
        }
      }
      // If we haven't assigned a journal yet, this might be it
      else if (!result.journal) {
        result.journal = part
      }
    }
  }

  return result
}

/**
 * Convert raw citations to structured Citation objects for database storage
 *
 * @param rawCitations - Array of raw citations extracted from text
 * @param messageId - ID of the message these citations belong to
 * @returns Array of structured Citation objects
 */
export function convertToStructuredCitations(
  rawCitations: RawCitation[],
  messageId: string
): Citation[] {
  return rawCitations.map(citation => {
    const parsedCitation = parseCitation(citation.text)

    return {
      id: `citation-${generateId()}`,
      messageId,
      title: parsedCitation.title || citation.text,
      authors: parsedCitation.authors,
      journal: parsedCitation.journal,
      year: parsedCitation.year,
      doi: parsedCitation.doi,
      url: parsedCitation.url,
      referenceNumber: citation.referenceNumber,
      inLibrary: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
}

/**
 * Highlights citations in text by wrapping citation markers with HTML tags
 *
 * This is useful for rendering citation markers as clickable elements in the UI.
 *
 * @param text - The text containing citation markers [n]
 * @param citationClass - CSS class to apply to the citation markers
 * @returns Text with HTML-wrapped citation markers
 */
export function highlightCitationsInText(
  text: string,
  citationClass: string = "citation-marker"
): string {
  if (!text) return ""

  // Replace [n] with <span class="citation-class">[n]</span>
  return text.replace(
    /\[(\d+)\]/g,
    `<span class="${citationClass}" data-citation-number="$1">[$1]</span>`
  )
}

/**
 * Clean citation text to normalize formatting
 *
 * @param citationText - The raw citation text
 * @returns Cleaned and normalized citation text
 */
export function cleanCitationText(citationText: string): string {
  if (!citationText) return ""

  return (
    citationText
      // Remove excessive whitespace
      .replace(/\s+/g, " ")
      // Normalize quotes
      .replace(/[""]/g, '"')
      // Normalize dashes
      .replace(/[–—]/g, "-")
      // Normalize multiple periods
      .replace(/\.{2,}/g, ".")
      // Ensure proper spacing after punctuation
      .replace(/([.,;:])(?!\s|$)/g, "$1 ")
      .trim()
  )
}

/**
 * Generate a DOI link URL from a DOI string
 *
 * @param doi - DOI string (e.g., "10.1234/abcd")
 * @returns Full DOI URL
 */
export function formatDoiLink(doi?: string): string | undefined {
  if (!doi) return undefined

  // Clean up the DOI
  const cleanDoi = doi.replace(/^doi:/i, "").trim()

  // Return a proper DOI URL
  return `https://doi.org/${cleanDoi}`
}

/**
 * Generate a citation text in a standardized format
 *
 * @param citation - The structured citation object
 * @returns Formatted citation text
 */
export function formatCitationText(citation: Partial<Citation>): string {
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

  // Join all non-empty parts with proper punctuation
  return parts.join(". ")
}
