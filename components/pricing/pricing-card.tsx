/**
 * Pricing Card Component
 *
 * This component renders an individual pricing tier card that displays
 * plan details, pricing information, and a call-to-action button.
 *
 * It is used within the pricing page to display different subscription options
 * with their features and pricing in a consistent format.
 *
 * @module components/pricing/pricing-card
 */

"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

/**
 * Interface for PricingCardProps
 */
export interface PricingCardProps {
  /**
   * The name of the pricing tier
   */
  title: string

  /**
   * Monthly price for this tier
   */
  monthlyPrice: string

  /**
   * Annual price for this tier (already calculated, not monthly × 12)
   */
  annualPrice: string

  /**
   * Description of the pricing tier
   */
  description: string

  /**
   * List of features included in this tier
   */
  features: string[]

  /**
   * Whether this is the most popular plan to highlight
   */
  isPopular?: boolean

  /**
   * Whether annual billing is selected (vs monthly)
   */
  isAnnual?: boolean

  /**
   * The URL for the action button
   */
  buttonLink?: string

  /**
   * The user's ID for tracking in payment links
   */
  userId?: string | null

  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * PricingCard Component
 *
 * @param props - The props for the PricingCard component
 * @returns A card displaying pricing information for a subscription tier
 */
export function PricingCard({
  title,
  monthlyPrice,
  annualPrice,
  description,
  features,
  isPopular = false,
  isAnnual = false,
  buttonLink,
  userId,
  className
}: PricingCardProps) {
  // Calculate the current price based on billing frequency
  const currentPrice = isAnnual ? annualPrice : monthlyPrice

  // Build the link with user ID for tracking if available
  const finalButtonLink =
    userId && buttonLink
      ? `${buttonLink}?client_reference_id=${userId}`
      : buttonLink || "#"

  // Build the period text based on billing frequency
  const period = isAnnual ? "/year" : "/month"

  return (
    <Card
      className={cn(
        "flex h-full flex-col transition-all duration-200",
        isPopular && "border-primary shadow-md",
        className
      )}
    >
      {/* Card header with title, description, and popular badge */}
      <CardHeader>
        <div className="space-y-1">
          {isPopular && (
            <div className="bg-primary text-primary-foreground inline-block rounded-full px-3 py-1 text-xs font-medium">
              Most Popular
            </div>
          )}
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>

      {/* Card content with pricing and features */}
      <CardContent className="flex flex-1 flex-col">
        {/* Price display */}
        <div className="mb-6 flex items-baseline">
          <span className="text-4xl font-bold">{currentPrice}</span>
          <span className="text-muted-foreground ml-2 text-sm font-medium">
            {period}
          </span>
        </div>

        {/* Features list */}
        <ul className="mb-6 space-y-3 text-sm">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              className="flex items-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.1 * index,
                ease: "easeOut"
              }}
            >
              <Check className="text-primary mr-2 mt-0.5 size-4 shrink-0" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </CardContent>

      {/* Card footer with action button */}
      <CardFooter className="pt-4">
        <Button
          className={cn("w-full", isPopular ? "bg-primary" : "bg-secondary")}
          asChild
        >
          <a
            href={finalButtonLink}
            className={cn(
              "inline-flex items-center justify-center",
              finalButtonLink === "#" && "pointer-events-none opacity-50"
            )}
          >
            Get {title}
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
