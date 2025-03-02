/*
<ai_context>
This server page is the marketing homepage for AttendMe.
</ai_context>
*/

"use server"

import { FeaturesSection } from "@/components/landing/features"
import { HeroSection } from "@/components/landing/hero"
import { InstitutionCarousel } from "@/components/landing/institution-carousel"
import { ReviewStreamer } from "@/components/landing/review-streamer"
import { Metadata } from "next"

/**
 * Metadata for the landing page (used by Next.js for SEO)
 */
export const metadata: Metadata = {
  title: "AttendMe - The attending in your pocket",
  description:
    "Medical assistant powered by AI providing specialized knowledge via chat to help healthcare professionals make informed decisions faster."
}

/**
 * Home page component for AttendMe marketing site
 *
 * This component orchestrates the overall landing page layout with carefully
 * structured responsive design patterns to ensure proper rendering on all devices.
 * Each section is designed to flow naturally and stack appropriately on mobile views.
 *
 * @returns A React server component rendering the responsive landing page
 */
export default async function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Hero section with main marketing message and CTA */}
      <HeroSection />

      {/* Institution carousel showing social proof - responsive to screen width */}
      <div className="w-full overflow-hidden">
        <InstitutionCarousel />
      </div>

      {/* Review streamer showing user testimonials - adapts to available width */}
      <div className="w-full">
        <ReviewStreamer />
      </div>

      {/* Features section highlighting app capabilities - responsive grid layout */}
      <FeaturesSection />

      {/* CTA section for final conversion opportunity */}
      <section className="bg-primary/5 w-full py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to transform your medical practice?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Join thousands of medical professionals using AttendMe to make
            better, faster decisions with specialized knowledge at their
            fingertips.
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <a
              href="/dashboard"
              className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-11 min-w-[150px] items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              Try AttendMe Free
            </a>
            <a
              href="/pricing"
              className="border-border bg-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-11 min-w-[150px] items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              See Pricing
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
