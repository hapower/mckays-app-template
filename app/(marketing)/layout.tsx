/*
<ai_context>
This server layout provides a shared header and basic structure for (marketing) routes.
</ai_context>
*/

"use server"

import { Suspense } from "react"
import Header from "@/components/header"
import { TailwindIndicator } from "@/components/utilities/tailwind-indicator"

/**
 * Props for the MarketingLayout component
 */
interface MarketingLayoutProps {
  /**
   * The child components to render within the layout
   */
  children: React.ReactNode
}

/**
 * MarketingLayout component
 *
 * @param children - The content to render within the layout
 * @returns A layout component wrapping all marketing pages
 */
export default async function MarketingLayout({
  children
}: MarketingLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Site header for navigation */}
      <Header />

      {/* Main content area */}
      <main className="flex-1">
        <Suspense
          fallback={<div className="container mx-auto py-12">Loading...</div>}
        >
          {children}
        </Suspense>
      </main>

      {/* Footer could be added here in the future */}
      <TailwindIndicator />
    </div>
  )
}
