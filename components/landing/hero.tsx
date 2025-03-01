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
 * Hero section component for AttendMe landing page
 *
 * @returns A React component rendering the hero section
 */
export const HeroSection = () => {
  // Randomly generated user count that increments periodically for social proof
  // This is just for visual effect in the MVP and would be replaced with actual user metrics
  const [userCount, setUserCount] = useState(4378)

  // Animation variants for staggered animations
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
    <div className="container mx-auto px-4 py-20 md:py-32">
      <motion.div
        className="mb-12 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* AttendMe Logo and Title */}
        <motion.div variants={itemVariants} className="mb-6">
          <AnimatedGradientText className="mb-4 inline-flex items-center gap-2">
            <div className="relative size-8">
              <Image
                src="/logo.svg"
                alt="AttendMe Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold">AttendMe</span>
          </AnimatedGradientText>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={itemVariants}
          className="mb-6 text-balance text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl"
        >
          The attending in your pocket
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-muted-foreground mb-8 max-w-2xl text-balance text-lg md:text-xl"
        >
          A medical assistant powered by AI that provides specialized knowledge
          via chat, helping healthcare professionals make informed decisions
          faster.
        </motion.p>

        {/* User Count Display */}
        <motion.div
          variants={itemVariants}
          className="text-muted-foreground mb-8 flex items-center"
        >
          <Users className="mr-2 size-5" />
          <span>{userCount.toLocaleString()}+ medical professionals</span>
        </motion.div>

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <Link href="/dashboard">
            <Button size="lg" className="group bg-blue-600 hover:bg-blue-700">
              Try AttendMe Now
              <ArrowRight className="ml-2 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Dashboard Preview */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="border-border bg-muted/30 mx-auto overflow-hidden rounded-xl border shadow-xl lg:max-w-5xl"
      >
        <Image
          src="/dashboard-preview.png"
          alt="AttendMe Dashboard Preview"
          width={1200}
          height={675}
          className="w-full object-cover"
          priority
        />
      </motion.div>
    </div>
  )
}
