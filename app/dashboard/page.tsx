/**
 * Dashboard Page
 *
 * This server component renders the main dashboard interface for the AttendMe application.
 * It displays a 2x2 grid layout containing the chat streamer, specialties selector,
 * library panel, and recent updates panel.
 *
 * This implementation uses the DashboardGrid component for responsive layout,
 * ensuring optimal display across all device sizes from mobile to desktop.
 *
 * @module app/dashboard/page
 */

"use server"

import { Suspense } from "react"
import { ChatStreamer } from "./_components/chat-streamer"
import { SpecialtiesSelector } from "./_components/specialties-selector"
import { LibraryBrowser } from "./_components/library-browser"
import { UpdatesBrowser } from "./_components/updates-browser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChatSkeleton } from "@/components/chat/chat-skeleton"
import { SpecialtySkeleton } from "@/components/specialties/specialty-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatPanel } from "@/components/dashboard/chat-panel"
import { SpecialtiesPanel } from "@/components/dashboard/specialties-panel"
import { DashboardGrid } from "@/components/dashboard/dashboard-grid"
import { auth } from "@clerk/nextjs/server"
import { getSpecialtiesAction } from "@/actions/db/specialties-actions"

/**
 * Dashboard Page Component
 *
 * Renders the main dashboard with a responsive 2x2 grid layout for the different panels.
 */
export default async function DashboardPage() {
  // Get the user ID from auth
  const { userId } = await auth()

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <h1 className="mb-4 text-2xl font-bold md:mb-6 md:text-3xl">Dashboard</h1>

      {/* Use DashboardGrid for responsive layout */}
      <DashboardGrid
        topLeftPanel={
          <Suspense fallback={<ChatSkeletonLoader />}>
            <ChatStreamerLoader userId={userId} />
          </Suspense>
        }
        topRightPanel={
          <Suspense fallback={<SpecialtySkeletonLoader />}>
            <SpecialtiesSelectorLoader userId={userId} />
          </Suspense>
        }
        bottomLeftPanel={
          <Suspense fallback={<LibrarySkeletonLoader />}>
            <LibraryBrowserLoader userId={userId} />
          </Suspense>
        }
        bottomRightPanel={
          <Suspense fallback={<UpdatesSkeletonLoader />}>
            <UpdatesBrowserLoader userId={userId} />
          </Suspense>
        }
      />
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
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-xl">Library</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto p-4">
        <LibraryBrowser userId={userId} specialties={specialties} />
      </CardContent>
    </Card>
  )
}

/**
 * Updates Browser Loader Component
 *
 * This component wraps the UpdatesBrowser for Suspense functionality.
 */
async function UpdatesBrowserLoader({ userId }: { userId: string | null }) {
  // If no userId is present, show message
  if (!userId) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full flex-col items-center justify-center p-6">
          <p className="text-center text-lg font-medium">
            Please sign in to access medical updates.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Get specialties for filtering in the updates browser
  const specialtiesResult = await getSpecialtiesAction()
  const specialties = specialtiesResult.isSuccess ? specialtiesResult.data : []

  // The UpdatesBrowser component is fully contained and doesn't need a wrapper
  return (
    <UpdatesBrowser
      userId={userId}
      specialties={specialties}
      className="h-full"
    />
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
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-xl">Medical Assistant</CardTitle>
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
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-xl">Medical Specialties</CardTitle>
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
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-xl">Library</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-32 w-full" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Updates Skeleton Loader
 *
 * Displays a loading skeleton for the updates panel while data is being fetched.
 */
function UpdatesSkeletonLoader() {
  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-xl">Recent Updates</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-8 w-full" />
        <div className="mt-4 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
