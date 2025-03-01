/**
 * Changelog Data Module
 *
 * This file provides types and data for the changelog feature.
 * It contains manual changelog entries that are displayed on the changelog page.
 *
 * @module lib/changelog
 */

/**
 * Type for a changelog entry to be displayed in the UI
 */
export interface ChangelogEntry {
  id: number
  title: string
  version: string
  date: string
  description: string
  isPrerelease: boolean
  author: {
    name: string
    avatarUrl?: string
  }
}

/**
 * Possible types of changes in a changelog entry
 */
export type ChangeType = "feature" | "bugfix" | "other"

/**
 * Determine whether changes should be categorized as a feature, bugfix, or other
 *
 * @param message - The changelog message to analyze
 * @returns The change type (feature, bugfix, or other)
 */
export function getChangeType(message: string): ChangeType {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes("feat") ||
    lowerMessage.includes("add") ||
    lowerMessage.includes("new") ||
    lowerMessage.includes("implement")
  ) {
    return "feature"
  }

  if (
    lowerMessage.includes("fix") ||
    lowerMessage.includes("bug") ||
    lowerMessage.includes("issue") ||
    lowerMessage.includes("error") ||
    lowerMessage.includes("resolve")
  ) {
    return "bugfix"
  }

  return "other"
}

/**
 * Format date for display in the changelog
 *
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "January 1, 2025")
 */
export function formatChangelogDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })
}

/**
 * Changelog data - manually maintained list of changes
 *
 * To add a new changelog entry:
 * 1. Add a new entry at the top of this array
 * 2. Increment the ID
 * 3. Update the title, version, date, and description fields
 */
export const changelogData: ChangelogEntry[] = [
  {
    id: 5,
    title: "Latest Updates",
    version: "v1.3.0",
    date: new Date("2025-02-28").toISOString(),
    description:
      "✨ New features and improvements.\n\n" +
      "### Features\n" +
      "- Added support for more medical specialties\n" +
      "- Enhanced UI with dark mode improvements\n" +
      "- New chat history management features\n" +
      "- Improved mobile experience\n\n" +
      "### Fixes\n" +
      "- Resolved RAG system accuracy issues\n" +
      "- Fixed responsive design on small screens\n" +
      "- Improved accessibility throughout the application",
    isPrerelease: false,
    author: {
      name: "Development Team"
    }
  },
  {
    id: 4,
    title: "Bug Fix Release",
    version: "v1.2.1",
    date: new Date("2025-02-15").toISOString(),
    description:
      "🐛 Bug fixes and stability improvements.\n\n" +
      "### Fixes\n" +
      "- Fixed citation display issues\n" +
      "- Resolved library search performance problems\n" +
      "- Fixed specialty selector loading state\n" +
      "- Improved error handling in chat interface\n\n" +
      "### Minor Improvements\n" +
      "- UI performance optimizations\n" +
      "- Reduced API calls for better efficiency",
    isPrerelease: false,
    author: {
      name: "Development Team"
    }
  },
  {
    id: 3,
    title: "Beta: RAG System Improvements",
    version: "v1.2.0-beta",
    date: new Date("2025-02-01").toISOString(),
    description:
      "🧠 Significantly improved RAG (Retrieval Augmented Generation) system.\n\n" +
      "### Features\n" +
      "- New vector embedding model\n" +
      "- Improved retrieval accuracy\n" +
      "- Added context weighting for better answers\n" +
      "- Enhanced specialty-specific knowledge\n\n" +
      "### Fixes\n" +
      "- Fixed rare embedding errors\n" +
      "- Improved performance on complex queries\n\n" +
      "This is a beta release and some features may still be unstable.",
    isPrerelease: true,
    author: {
      name: "Development Team"
    }
  },
  {
    id: 2,
    title: "Feature Update: Enhanced References",
    version: "v1.1.0",
    date: new Date("2025-01-15").toISOString(),
    description:
      "📚 Improved reference handling and citation quality.\n\n" +
      "### Features\n" +
      "- Enhanced citation extraction\n" +
      "- Better metadata parsing for references\n" +
      "- Added DOI lookup functionality\n" +
      "- Improved library search features\n\n" +
      "### Fixes\n" +
      "- Resolved issue with reference formatting\n" +
      "- Fixed search functionality in library panel",
    isPrerelease: false,
    author: {
      name: "Development Team"
    }
  },
  {
    id: 1,
    title: "Initial Release",
    version: "v1.0.0",
    date: new Date("2025-01-01").toISOString(),
    description:
      "🚀 Initial release of AttendMe with core functionality.\n\n" +
      "### Features\n" +
      "- AI chat interface with medical knowledge\n" +
      "- Specialty selection for tailored responses\n" +
      "- Citation system with reference tracking\n" +
      "- Basic library functionality\n\n" +
      "### Known Issues\n" +
      "- Limited specialty coverage\n" +
      "- Citations sometimes miss important details",
    isPrerelease: false,
    author: {
      name: "Development Team"
    }
  }
]
