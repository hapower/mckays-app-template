/**
 * Feedback Page
 *
 * This page provides a form for users to submit feedback, bug reports,
 * feature requests, and questions about the AttendMe application.
 *
 * The page is part of the marketing section and uses the shared marketing layout.
 * It integrates the FeedbackForm component to handle the actual form submission.
 *
 * @module app/(marketing)/feedback/page
 */

"use server"

import { Metadata } from "next"
import { FeedbackForm } from "@/components/feedback/feedback-form"

/**
 * Metadata for the feedback page (used by Next.js for SEO)
 */
export const metadata: Metadata = {
  title: "Feedback | AttendMe",
  description:
    "Share your thoughts, report bugs, or request features to help us improve AttendMe."
}

/**
 * FeedbackPage component
 *
 * Server component that renders the feedback page with the feedback form.
 */
export default async function FeedbackPage() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          We're constantly working to improve AttendMe and your feedback is
          invaluable.
        </p>
      </div>

      <div className="mx-auto">
        <FeedbackForm />
      </div>

      <div className="mt-16 rounded-lg border p-6">
        <h2 className="text-2xl font-semibold">Other Ways to Reach Us</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-medium">Support Email</h3>
            <p className="text-muted-foreground">
              For urgent issues or support requests, email us at{" "}
              <a
                href="mailto:support@attendme.example.com"
                className="text-primary underline"
              >
                support@attendme.example.com
              </a>
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium">Social Media</h3>
            <p className="text-muted-foreground">
              Follow us on{" "}
              <a href="#" className="text-primary underline">
                Twitter
              </a>{" "}
              or{" "}
              <a href="#" className="text-primary underline">
                LinkedIn
              </a>{" "}
              for announcements and updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
