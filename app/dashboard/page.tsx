/**
 * Dashboard Page
 *
 * This server component renders the main dashboard interface for the AttendMe application.
 * It displays a 2x2 grid layout containing the chat streamer, specialties selector,
 * library panel, and recent updates panel.
 *
 * This implementation includes the chat streamer and specialties selector panels,
 * with placeholders for the library and updates panels that will be implemented
 * in future steps.
 *
 * @module app/dashboard/page
 */

"use server"

import { Suspense } from "react"
import { ChatStreamer } from "./_components/chat-streamer"
import { SpecialtiesSelector } from "./_components/specialties-selector"
import { LibraryBrowser } from "./_components/library-browser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatSkeleton } from "@/components/chat/chat-skeleton"
import { SpecialtySkeleton } from "@/components/specialties/specialty-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { SpecialtiesPanel } from "@/components/dashboard/specialties-panel"
import { auth } from "@clerk/nextjs/server"
import { getSpecialtiesAction } from "@/actions/db/specialties-actions"

/**
 * Dashboard Page Component
 *
 * Renders the main dashboard with a 2x2 grid layout for the different panels.
 */
export default async function DashboardPage() {
  // Get the user ID from auth
  const { userId } = await auth()

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      {/* 2x2 Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chat Streamer Panel */}
        <div className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-14rem)]">
          <Suspense fallback={<ChatSkeletonLoader />}>
            <ChatStreamerLoader userId={userId} />
          </Suspense>
        </div>

        {/* Specialties Selector Panel */}
        <div className="h-[calc(100vh-12rem)] lg:h-[calc(100vh-14rem)]">
          <Suspense fallback={<SpecialtySkeletonLoader />}>
            <SpecialtiesSelectorLoader userId={userId} />
          </Suspense>
        </div>

        {/* Library Panel */}
        <div className="h-[calc(50vh-8rem)] lg:h-[calc(50vh-9rem)]">
          <Suspense fallback={<LibrarySkeletonLoader />}>
            <LibraryBrowserLoader userId={userId} />
          </Suspense>
        </div>

        {/* Updates Panel - Placeholder */}
        <div className="h-[calc(50vh-8rem)] lg:h-[calc(50vh-9rem)]">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Updates panel will be implemented in a future step.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * Chat Streamer Loader Component
 *
 * This component wraps the ChatStreamer for Suspense functionality.
 */
function ChatStreamerLoader({ userId }: { userId: string | null }) {
  // If no userId is present, show message
  if (!userId) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full flex-col items-center justify-center p-6">
          <p className="text-center text-lg font-medium">
            Please sign in to use the chat interface.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <ChatStreamer userId={userId} />
}

/**
 * Specialties Selector Loader Component
 *
 * This component wraps the SpecialtiesSelector for Suspense functionality.
 */
function SpecialtiesSelectorLoader({ userId }: { userId: string | null }) {
  // If no userId is present, show message
  if (!userId) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full flex-col items-center justify-center p-6">
          <p className="text-center text-lg font-medium">
            Please sign in to select specialties.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <SpecialtiesPanel title="Medical Specialties">
      <SpecialtiesSelector />
    </SpecialtiesPanel>
  )
}

/**
 * Library Browser Loader Component
 *
 * This component wraps the LibraryBrowser for Suspense functionality.
 */
async function LibraryBrowserLoader({ userId }: { userId: string | null }) {
  // If no userId is present, show message
  if (!userId) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full flex-col items-center justify-center p-6">
          <p className="text-center text-lg font-medium">
            Please sign in to access your library.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Get specialties for filtering in the library browser
  const specialtiesResult = await getSpecialtiesAction()
  const specialties = specialtiesResult.isSuccess ? specialtiesResult.data : []

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Library</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <LibraryBrowser userId={userId} specialties={specialties} />
      </CardContent>
    </Card>
  )
}

/**
 * Chat Skeleton Loader
 *
 * Displays a loading skeleton for the chat while data is being fetched.
 */
function ChatSkeletonLoader() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Medical Assistant</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ChatSkeleton messageCount={3} />
      </CardContent>
    </Card>
  )
}

/**
 * Specialty Skeleton Loader
 *
 * Displays a loading skeleton for the specialties panel while data is being fetched.
 */
function SpecialtySkeletonLoader() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Medical Specialties</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <SpecialtySkeleton count={6} grouped />
      </CardContent>
    </Card>
  )
}

/**
 * Library Skeleton Loader
 *
 * Displays a loading skeleton for the library panel while data is being fetched.
 */
function LibrarySkeletonLoader() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Library</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-full" />
      </CardContent>
    </Card>
  )
}
