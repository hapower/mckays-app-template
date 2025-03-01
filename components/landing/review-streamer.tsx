/**
 * Review Streamer Component
 *
 * This component creates an animated horizontal stream of user reviews for the
 * AttendMe application. It provides social proof by showcasing positive feedback
 * from medical professionals who use the platform.
 *
 * Features:
 * - Continuous horizontal scrolling animation
 * - Star rating display
 * - User details and verification badge for credibility
 * - Responsive design that works on all screen sizes
 * - Gradient fade effect at edges for seamless appearance
 * - Customizable animation speed and review data
 *
 * @module components/landing/review-streamer
 */

"use client"

import { motion } from "framer-motion"
import { CheckCircle, Star } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

/**
 * Interface for a user review
 */
interface Review {
  /**
   * Unique identifier for the review
   */
  id: string
  /**
   * The reviewer's name
   */
  name: string
  /**
   * Reviewer's role or position (e.g., "Cardiologist")
   */
  role: string
  /**
   * The review content/testimonial
   */
  content: string
  /**
   * Star rating (1-5)
   */
  rating: number
  /**
   * Whether the reviewer is verified
   */
  verified?: boolean
  /**
   * Time since the review was posted (e.g., "2 weeks ago")
   */
  timeAgo?: string
}

/**
 * Props for the ReviewStreamer component
 */
interface ReviewStreamerProps {
  /**
   * Optional array of reviews to display
   * If not provided, default reviews will be used
   */
  reviews?: Review[]
  /**
   * Optional title for the review section
   */
  title?: string
  /**
   * Optional CSS class names
   */
  className?: string
  /**
   * Speed of animation in seconds (default: 60)
   */
  animationDuration?: number
}

/**
 * Default reviews to display if none are provided
 */
const defaultReviews: Review[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    content:
      "AttendMe has revolutionized how I stay updated with latest research. The specialty-specific responses save me hours of research time.",
    rating: 5,
    verified: true,
    timeAgo: "2 weeks ago"
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    role: "Emergency Medicine",
    content:
      "In fast-paced ER situations, having quick access to evidence-based information is invaluable. This tool has become my go-to resource.",
    rating: 5,
    verified: true,
    timeAgo: "1 month ago"
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    role: "Pediatrician",
    content:
      "The reference library feature is outstanding. I can quickly save and organize important citations for later review or sharing with colleagues.",
    rating: 5,
    verified: true,
    timeAgo: "3 weeks ago"
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    role: "Neurologist",
    content:
      "The specificity of the AI responses in my specialty is impressive. It feels like having a knowledgeable colleague available 24/7.",
    rating: 5,
    timeAgo: "1 week ago"
  },
  {
    id: "5",
    name: "Dr. Olivia Thompson",
    role: "Dermatology Resident",
    content:
      "As a resident, this has been an incredible learning tool. It helps me quickly check treatment protocols and find relevant research.",
    rating: 4,
    verified: true,
    timeAgo: "2 months ago"
  },
  {
    id: "6",
    name: "Dr. Robert Kim",
    role: "Oncologist",
    content:
      "The citation feature ensures I can verify information sources. Critical for evidence-based practice in oncology.",
    rating: 5,
    verified: true,
    timeAgo: "3 weeks ago"
  },
  {
    id: "7",
    name: "Dr. Priya Patel",
    role: "Internal Medicine",
    content:
      "I use AttendMe daily for quick reference checks. The interface is intuitive and the responses are clinically relevant.",
    rating: 5,
    verified: true,
    timeAgo: "1 month ago"
  }
]

/**
 * Component to render an individual star in the rating
 */
const StarIcon = ({ filled }: { filled: boolean }) => {
  return (
    <Star
      className={cn(
        "size-4",
        filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
      )}
    />
  )
}

/**
 * Component to render a star rating (1-5 stars)
 */
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(star => (
        <StarIcon key={star} filled={star <= rating} />
      ))}
    </div>
  )
}

/**
 * ReviewStreamer component
 *
 * @param reviews - Array of reviews to display
 * @param title - Title for the review section
 * @param className - Additional CSS class names
 * @param animationDuration - Speed of animation in seconds (default: 60)
 * @returns A continuously scrolling stream of user reviews
 */
export function ReviewStreamer({
  reviews = defaultReviews,
  title = "What our users are saying",
  className,
  animationDuration = 60
}: ReviewStreamerProps) {
  const { theme } = useTheme() // Get current theme for styling
  const [isMounted, setIsMounted] = useState(false)

  // Handle component mounting to avoid hydration mismatch with theme
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Add duplicate reviews to create seamless looping effect
  const duplicatedReviews = [...reviews, ...reviews]

  // If not mounted yet, don't render to avoid hydration issues
  if (!isMounted) {
    return null
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-gray-50 py-12 dark:bg-gray-900",
        className
      )}
    >
      <div className="container mx-auto mb-8 px-4">
        <h2 className="text-center text-2xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
      </div>

      {/* Reviews carousel */}
      <div className="relative flex overflow-hidden">
        <motion.div
          className="flex flex-nowrap"
          animate={{ x: "-50%" }}
          transition={{
            ease: "linear",
            duration: animationDuration,
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{ willChange: "transform" }} // Performance optimization
        >
          {duplicatedReviews.map((review, index) => (
            <div
              key={`${review.id}-${index}`}
              className="mx-4 w-80 shrink-0 md:w-96"
            >
              <div
                className={cn(
                  "h-full rounded-xl p-6 shadow-md transition-transform duration-300 hover:scale-105",
                  theme === "dark"
                    ? "bg-gray-800 text-gray-100"
                    : "bg-white text-gray-800"
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  {review.timeAgo && (
                    <span className="text-muted-foreground text-sm">
                      {review.timeAgo}
                    </span>
                  )}
                </div>

                <p className="mb-6 text-sm leading-relaxed md:text-base">
                  "{review.content}"
                </p>

                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full font-semibold",
                      theme === "dark"
                        ? "bg-gray-700"
                        : "bg-blue-100 text-blue-800"
                    )}
                  >
                    {review.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="font-medium">{review.name}</p>
                      {review.verified && (
                        <CheckCircle className="text-primary ml-1 size-4" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {review.role}
                    </p>
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
