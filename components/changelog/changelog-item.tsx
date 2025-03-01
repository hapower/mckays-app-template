/**
 * Changelog Item Component
 *
 * This component displays a single changelog entry, which could be a release
 * or a significant update. It formats the changelog information including
 * version, date, author, and description in an expandable card format.
 *
 * Key features:
 * - Expandable/collapsible view for detailed descriptions
 * - Visual indicators for different types of changes (features, bugfixes)
 * - Release/version information display
 * - Formatted date display
 *
 * @module components/changelog/changelog-item
 */

"use client"

import { useState } from "react"
import { Calendar, ChevronDown, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  ChangelogEntry,
  formatChangelogDate,
  getChangeType
} from "@/lib/changelog"

export interface ChangelogItemProps {
  /**
   * The changelog entry to display
   */
  entry: ChangelogEntry
  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * A component that displays a single changelog item
 *
 * @example
 * ```tsx
 * <ChangelogItem entry={someEntry} />
 * ```
 */
export function ChangelogItem({ entry, className }: ChangelogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Convert plain text description to HTML with line breaks and preserve markdown-style lists
  const formatDescription = (text: string) => {
    // Replace markdown headers (### Title) with strong elements
    let formatted = text.replace(/### (.*)/g, "<strong>$1</strong>")

    // Replace markdown list items (- Item) with list items
    formatted = formatted.replace(/- (.*)/g, "• $1")

    // Replace double newlines with paragraph breaks
    formatted = formatted.replace(/\n\n/g, "<br/><br/>")

    // Replace single newlines with line breaks
    formatted = formatted.replace(/\n/g, "<br/>")

    return formatted
  }

  // Determine if this is a feature, bugfix, or other type of change
  const changeType = getChangeType(entry.title + " " + entry.description)

  // Format the date for display
  const formattedDate = formatChangelogDate(entry.date)

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        isExpanded && "shadow-md",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                entry.isPrerelease
                  ? "outline"
                  : changeType === "feature"
                    ? "default"
                    : changeType === "bugfix"
                      ? "destructive"
                      : "secondary"
              }
            >
              {entry.isPrerelease
                ? "Beta"
                : changeType === "feature"
                  ? "Feature"
                  : changeType === "bugfix"
                    ? "Fix"
                    : "Update"}
            </Badge>

            <div className="text-muted-foreground flex items-center text-sm">
              <Tag className="mr-1 size-3" />
              <span>{entry.version}</span>
            </div>
          </div>

          <div className="text-muted-foreground flex items-center text-sm">
            <Calendar className="mr-1 size-3" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <CardTitle className="mt-2 text-xl font-bold">{entry.title}</CardTitle>

        <CardDescription className="mt-1 flex items-center gap-1">
          <span>By {entry.author.name}</span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            "prose prose-sm dark:prose-invert w-full max-w-none transition-all duration-200",
            !isExpanded && "line-clamp-2"
          )}
          dangerouslySetInnerHTML={{
            __html: formatDescription(entry.description)
          }}
        />
      </CardContent>

      <CardFooter className="flex justify-between pb-4 pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-1"
        >
          <span>{isExpanded ? "Show Less" : "Show More"}</span>
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </Button>
      </CardFooter>
    </Card>
  )
}
