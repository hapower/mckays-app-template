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

/**
 * Home page component for AttendMe marketing site
 *
 * @returns A React server component rendering the landing page
 */
export default async function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero section with main marketing message and CTA */}
      <HeroSection />

      {/* Institution carousel showing social proof */}
      <InstitutionCarousel />

      {/* Review streamer showing user testimonials */}
      <ReviewStreamer />

      {/* Features section highlighting the app capabilities */}
      <FeaturesSection />

      {/* More sections can be added here as needed:
          - Specialty showcase
          - Pricing comparison
          - FAQ section
          - Newsletter signup
          - etc.
      */}
    </div>
  )
}
