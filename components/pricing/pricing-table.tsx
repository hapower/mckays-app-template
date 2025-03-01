/**
 * Pricing Table Component
 *
 * This component renders a complete pricing table with multiple pricing tiers.
 * It provides a billing frequency toggle and organizes multiple pricing cards
 * into a cohesive pricing section.
 *
 * @module components/pricing/pricing-table
 */

"use client"

import { useState } from "react"
import { PricingCard } from "./pricing-card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

/**
 * Interface for PricingTableProps
 */
export interface PricingTableProps {
  /**
   * The current user's ID for tracking in payment links
   */
  userId?: string | null

  /**
   * Stripe payment link for monthly student tier
   */
  studentMonthlyLink?: string

  /**
   * Stripe payment link for monthly pro tier
   */
  proMonthlyLink?: string

  /**
   * Stripe payment link for annual pro tier
   */
  proAnnualLink?: string

  /**
   * Optional additional CSS classes
   */
  className?: string
}

/**
 * PricingTable Component
 *
 * This component displays a comprehensive pricing table with
 * multiple pricing tiers and a billing frequency toggle.
 *
 * @param props - The props for the PricingTable component
 * @returns A complete pricing table with toggle and all pricing tiers
 */
export function PricingTable({
  userId,
  studentMonthlyLink,
  proMonthlyLink,
  proAnnualLink,
  className
}: PricingTableProps) {
  // State for tracking whether annual billing is selected
  const [isAnnual, setIsAnnual] = useState(false)

  // Features for each pricing tier
  const studentFeatures = [
    "Complete RAG-enhanced medical assistant",
    "Basic specialty selection",
    "Library for reference storage",
    "Medical updates feed",
    "Limited usage (100 queries/day)"
  ]

  const proFeatures = [
    "All Student features",
    "Unlimited usage",
    "Advanced RAG with better sources",
    "Full specialty coverage",
    "Priority support",
    "Citation export functionality",
    "Deeper medical knowledge base"
  ]

  const annualFeatures = [
    "All Pro features",
    "2 months free",
    "Early access to new features",
    "Advanced analytics",
    "Bulk reference export"
  ]

  return (
    <div className={className}>
      {/* Billing toggle */}
      <div className="mb-8 flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Choose Your Billing Period</h2>

        <div className="flex items-center space-x-3">
          <span className={!isAnnual ? "font-medium" : "text-muted-foreground"}>
            Monthly
          </span>

          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            id="billing-toggle"
          />

          <Label
            htmlFor="billing-toggle"
            className={isAnnual ? "font-medium" : "text-muted-foreground"}
          >
            Annual <span className="text-primary font-medium">(Save 17%)</span>
          </Label>
        </div>
      </div>

      {/* Pricing cards grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {/* Student tier */}
        <PricingCard
          title="Student"
          monthlyPrice="$10"
          annualPrice="$100"
          description="Perfect for medical students and residents"
          features={studentFeatures}
          isAnnual={isAnnual}
          buttonLink={studentMonthlyLink}
          userId={userId}
        />

        {/* Pro tier */}
        <PricingCard
          title="Pro"
          monthlyPrice="$25"
          annualPrice="$250"
          description="For physicians and healthcare professionals"
          features={proFeatures}
          isPopular={true}
          isAnnual={isAnnual}
          buttonLink={isAnnual ? proAnnualLink : proMonthlyLink}
          userId={userId}
        />

        {/* Annual tier (only displayed if annual billing is selected) */}
        <PricingCard
          title="Annual Pro"
          monthlyPrice="$250" // Shown if user switches back to monthly
          annualPrice="$250"
          description="Best value for serious medical professionals"
          features={annualFeatures}
          isAnnual={true} // Always show annual price
          buttonLink={proAnnualLink}
          userId={userId}
        />
      </div>

      {/* Additional information */}
      <div className="text-muted-foreground mt-12 text-center">
        <p className="text-sm">
          All plans include a 14-day money-back guarantee. No credit card
          required to try.
        </p>
        <p className="mt-2 text-sm">
          Need a custom plan for your institution?{" "}
          <a href="/contact" className="text-primary hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
