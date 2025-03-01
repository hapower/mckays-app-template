/**
 * Changelog Page
 *
 * This server component renders the changelog page, which displays a history
 * of releases, updates, and changes to the application. It shows manually maintained
 * changelog entries in a structured and filterable format.
 *
 * The page includes:
 * - A header with title and description
 * - A filterable list of releases and updates
 * - Release notes, features, and bug fixes
 *
 * @module app/(marketing)/changelog/page
 */

"use server"

import { Suspense } from "react"
import { FileWarning } from "lucide-react"

import { ChangelogList } from "@/components/changelog/changelog-list"
import { changelogData } from "@/lib/changelog"

/**
 * Async component to display changelog data
 */
async function ChangelogData() {
  try {
    // Load changelog data from our manually maintained list
    return <ChangelogList entries={changelogData} />
  } catch (error) {
    console.error("Error loading changelog:", error)
    return <ChangelogError />
  }
}

/**
 * Loading component
 */
function ChangelogLoading() {
  return <ChangelogList entries={[]} isLoading={true} />
}

/**
 * Error component
 */
function ChangelogError() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileWarning className="text-destructive mb-4 size-12" />
      <h3 className="text-lg font-medium">Something went wrong</h3>
      <p className="text-muted-foreground mt-1 max-w-md text-sm">
        We couldn't load the changelog. Please try again later.
      </p>
    </div>
  )
}

/**
 * Changelog Page component
 */
export default async function ChangelogPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          The latest updates, features, and improvements to our application
        </p>
      </div>

      <Suspense fallback={<ChangelogLoading />}>
        <ChangelogData />
      </Suspense>
    </div>
  )
}
