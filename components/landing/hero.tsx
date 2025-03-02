/*
<ai_context>
This client component provides the hero section for the AttendMe landing page.
</ai_context>
*/

"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Users } from "lucide-react"
import { useState, useEffect } from "react"
import AnimatedGradientText from "../magicui/animated-gradient-text"

/**
 * Animation variants for staggered animations
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

/**
 * Hero section component for AttendMe landing page
 *
 * This component implements responsive design for all screen sizes:
 * - Mobile (<640px): Vertically stacked layout with appropriately sized elements
 * - Tablet (640px-1023px): Enhanced spacing and larger text elements
 * - Desktop (1024px+): Full layout with optimal spacing and element sizing
 *
 * @returns A React component rendering the responsive hero section
 */
export const HeroSection = () => {
  // Randomly generated user count that increments periodically for social proof
  // This is just for visual effect in the MVP and would be replaced with actual user metrics
  const [userCount, setUserCount] = useState(4378)

  // Periodically increment the user count for visual effect
  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prevCount => {
        // Randomly increment by 1-3 users
        const increment = Math.floor(Math.random() * 3) + 1
        return prevCount + increment
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient effect - subtle on mobile, more prominent on larger screens */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent opacity-40 dark:from-blue-900/20 dark:via-transparent dark:to-transparent"></div>

      <div className="container mx-auto px-4 py-12 sm:py-20 md:py-24 lg:py-32">
        <motion.div
          className="mb-8 flex flex-col items-center text-center lg:mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* AttendMe Logo and Title - Responsive sizing */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <AnimatedGradientText className="mb-2 inline-flex items-center gap-2 sm:mb-4">
              <div className="relative size-6 sm:size-7 md:size-8">
                <Image
                  src="/logo.svg"
                  alt="AttendMe Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl font-bold sm:text-2xl md:text-3xl">
                AttendMe
              </span>
            </AnimatedGradientText>
          </motion.div>

          {/* Main Headline - Responsive text scaling */}
          <motion.h1
            variants={itemVariants}
            className="mb-4 text-balance text-3xl font-extrabold tracking-tight sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl"
          >
            The attending in your pocket
          </motion.h1>

          {/* Subheadline - Responsive width and text size */}
          <motion.p
            variants={itemVariants}
            className="text-muted-foreground mb-6 max-w-xs text-balance text-base sm:max-w-lg sm:text-lg md:max-w-2xl md:text-xl lg:mb-8"
          >
            A medical assistant powered by AI that provides specialized
            knowledge via chat, helping healthcare professionals make informed
            decisions faster.
          </motion.p>

          {/* User Count Display - Consistent across screen sizes */}
          <motion.div
            variants={itemVariants}
            className="text-muted-foreground mb-6 flex items-center sm:mb-8"
          >
            <Users className="mr-2 size-4 sm:size-5" />
            <span className="text-sm sm:text-base">
              {userCount.toLocaleString()}+ medical professionals
            </span>
          </motion.div>

          {/* CTA Button - Appropriately sized for all devices */}
          <motion.div variants={itemVariants}>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="group min-w-[200px] bg-blue-600 hover:bg-blue-700"
              >
                Try AttendMe Now
                <ArrowRight className="ml-2 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview - Responsive sizing and margins */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="border-border bg-muted/30 mx-auto overflow-hidden rounded-xl border shadow-xl sm:max-w-2xl md:max-w-3xl lg:max-w-5xl"
        >
          {/* Responsive image with aspect ratio handling */}
          <div className="relative aspect-video w-full">
            <Image
              src="/dashboard-preview.png"
              alt="AttendMe Dashboard Preview"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
              priority
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
