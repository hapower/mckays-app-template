/**
 * Pricing Page
 *
 * This server component renders the pricing page for the AttendMe application,
 * displaying tiered subscription options using the PricingTable component.
 *
 * It showcases the following pricing tiers:
 * - Student tier ($10/month)
 * - Pro subscription ($25/month)
 * - Annual membership ($250/year)
 *
 * The page also includes a FAQ section to address common pricing questions.
 *
 * @module app/(marketing)/pricing/page
 */

"use server"

import { Metadata } from "next"
import { PricingTable } from "@/components/pricing/pricing-table"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { auth } from "@clerk/nextjs/server"

/**
 * Metadata for the pricing page (used by Next.js for SEO)
 */
export const metadata: Metadata = {
  title: "Pricing | AttendMe",
  description:
    "Affordable subscription plans for medical professionals and students. Choose the plan that fits your needs."
}

/**
 * PricingPage Component
 *
 * This component renders the pricing page with a pricing table and FAQ section.
 *
 * @returns A server component that displays the pricing options
 */
export default async function PricingPage() {
  // Get user ID from authentication (if logged in)
  const { userId } = await auth()

  // Payment links from environment variables
  const studentMonthlyLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STUDENT
  const proMonthlyLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY
  const proAnnualLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY

  return (
    <div className="container mx-auto max-w-5xl py-12">
      {/* Page header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Choose the plan that fits your needs. Cancel anytime.
        </p>
      </div>

      {/* Pricing table */}
      <PricingTable
        userId={userId}
        studentMonthlyLink={studentMonthlyLink}
        proMonthlyLink={proMonthlyLink}
        proAnnualLink={proAnnualLink}
      />

      {/* FAQ section */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-2xl font-bold">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              What's the difference between Student and Pro plans?
            </AccordionTrigger>
            <AccordionContent>
              The Student plan is designed specifically for medical students and
              residents with a limited budget. It provides all essential
              features but with usage limits. The Pro plan offers unlimited
              access, more comprehensive specialty coverage, and priority
              support for practicing physicians and healthcare professionals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>
              Can I switch between monthly and annual billing?
            </AccordionTrigger>
            <AccordionContent>
              Yes, you can switch between monthly and annual billing at any
              time. If you switch from monthly to annual, you'll be billed the
              annual amount immediately. If you switch from annual to monthly,
              your plan will continue until your annual subscription ends, then
              switch to monthly billing.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              Is there a free trial available?
            </AccordionTrigger>
            <AccordionContent>
              We don't currently offer a free tier, but we do provide a 14-day
              money-back guarantee. You can sign up for any plan, try it out for
              up to two weeks, and if you're not satisfied, contact us for a
              full refund.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              Do you offer discounts for institutions or groups?
            </AccordionTrigger>
            <AccordionContent>
              Yes, we offer special pricing for medical institutions, hospitals,
              clinics, and academic groups. Please contact our sales team
              through the Contact page for more information about enterprise
              pricing and volume discounts.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger>
              How do I cancel my subscription?
            </AccordionTrigger>
            <AccordionContent>
              You can cancel your subscription at any time through your account
              settings. After cancellation, you'll continue to have access to
              your subscription until the end of your current billing period. We
              don't offer partial refunds for unused time, except during the
              14-day money-back guarantee period.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Contact CTA */}
      <div className="bg-muted/50 mt-16 rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium">Need help choosing a plan?</h3>
        <p className="text-muted-foreground mt-2">
          Our team is happy to answer your questions and help you find the right
          plan.
        </p>
        <div className="mt-4">
          <a
            href="/contact"
            className="hover:bg-primary/90 focus:ring-ring bg-primary text-primary-foreground inline-flex h-10 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
