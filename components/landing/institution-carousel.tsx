/**
 * Institution Carousel Component
 *
 * This component renders a horizontally scrolling carousel of institution logos
 * for the landing page. It demonstrates social proof by showcasing medical
 * institutions that use the AttendMe service.
 *
 * Features:
 * - Infinite horizontal scrolling animation
 * - Automatic and smooth animation
 * - Responsive design that adapts to different screen sizes
 * - Support for both light and dark themes
 * - Performance optimization with hardware acceleration
 *
 * @module components/landing/institution-carousel
 */

"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import Image from "next/image"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Interface for an institution item to be displayed in the carousel
 */
interface Institution {
  /**
   * Name of the institution
   */
  name: string
  /**
   * Path to the institution's logo image
   */
  logo: string
  /**
   * Additional description or tagline (optional)
   */
  description?: string
}

/**
 * Props for the InstitutionCarousel component
 */
interface InstitutionCarouselProps {
  /**
   * Optional array of institutions to display
   * If not provided, default institutions will be used
   */
  institutions?: Institution[]
  /**
   * Optional title for the carousel section
   */
  title?: string
  /**
   * Optional CSS class names
   */
  className?: string
}

/**
 * Default institutions to display if none are provided
 */
const defaultInstitutions: Institution[] = [
  { name: "Mayo Clinic", logo: "/institutions/mayo-clinic.svg" },
  { name: "Cleveland Clinic", logo: "/institutions/cleveland-clinic.svg" },
  { name: "Johns Hopkins Hospital", logo: "/institutions/johns-hopkins.svg" },
  {
    name: "Massachusetts General Hospital",
    logo: "/institutions/mass-general.svg"
  },
  { name: "UCLA Medical Center", logo: "/institutions/ucla-medical.svg" },
  { name: "Stanford Health Care", logo: "/institutions/stanford-health.svg" },
  { name: "Mount Sinai Hospital", logo: "/institutions/mount-sinai.svg" },
  { name: "NewYork-Presbyterian", logo: "/institutions/ny-presbyterian.svg" },
  {
    name: "University of Michigan Health",
    logo: "/institutions/michigan-health.svg"
  },
  { name: "UCSF Medical Center", logo: "/institutions/ucsf-medical.svg" }
]

/**
 * InstitutionCarousel component
 *
 * @param institutions - Array of institutions to display
 * @param title - Title for the carousel section
 * @param className - Additional CSS class names
 * @returns A horizontally scrolling carousel of institution logos
 */
export function InstitutionCarousel({
  institutions = defaultInstitutions,
  title = "Trusted by leading medical institutions",
  className
}: InstitutionCarouselProps) {
  const { theme } = useTheme() // Get current theme for proper logo styling
  const [isMounted, setIsMounted] = useState(false)

  // Handle component mounting to avoid hydration mismatch with theme
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Duplicate institutions for seamless infinite scrolling effect
  const duplicatedInstitutions = [...institutions, ...institutions]

  // If not mounted yet, don't render to avoid hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gray-50 py-10 dark:bg-gray-900",
        className
      )}
    >
      <div className="container mx-auto mb-6 px-4">
        <h2 className="text-center text-xl font-medium text-gray-600 dark:text-gray-300">
          {title}
        </h2>
      </div>

      {/* Logo carousel */}
      <div className="relative flex overflow-hidden">
        {/* First set of logos */}
        <motion.div
          className="flex flex-nowrap items-center"
          animate={{ x: "-50%" }}
          transition={{
            ease: "linear",
            duration: 25,
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{ willChange: "transform" }} // Performance optimization
        >
          {duplicatedInstitutions.map((institution, index) => (
            <div
              key={`${institution.name}-${index}`}
              className="mx-8 shrink-0 py-2"
            >
              <div className="flex h-12 w-32 items-center justify-center sm:h-16 sm:w-48">
                {/* Use a generic placeholder for now since we don't have actual logo files */}
                <div
                  className={cn(
                    "flex size-full items-center justify-center rounded-lg p-2",
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center text-center",
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    )}
                  >
                    <span className="text-xs font-bold">
                      {institution.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Gradient overlays for smooth fade effect on edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-50 dark:from-gray-900"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-50 dark:from-gray-900"></div>
    </section>
  )
}
