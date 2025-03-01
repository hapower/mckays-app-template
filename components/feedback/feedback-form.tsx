/**
 * Feedback Form Component
 *
 * This component provides a form for users to submit feedback, bug reports,
 * feature requests, and questions. It handles form state, validation,
 * submission, and error/success messaging.
 *
 * Features:
 * - Real-time form validation
 * - Multiple feedback types (general, bug, feature, question)
 * - Loading state management
 * - Success/error feedback to users
 * - Responsive design
 *
 * @module components/feedback/feedback-form
 */

"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  FeedbackData,
  FeedbackType,
  submitFeedbackAction
} from "@/actions/feedback-actions"

/**
 * Props for the FeedbackForm component
 */
interface FeedbackFormProps {
  /**
   * Optional CSS class names to apply to the component
   */
  className?: string
}

/**
 * Form validation errors interface
 */
interface FormErrors {
  name?: string
  email?: string
  type?: string
  subject?: string
  message?: string
}

/**
 * FeedbackForm component
 *
 * @param className - Optional CSS class to apply to the form
 */
export function FeedbackForm({ className }: FeedbackFormProps) {
  // Form state
  const [formData, setFormData] = useState<FeedbackData>({
    name: "",
    email: "",
    type: FeedbackType.GENERAL,
    subject: "",
    message: ""
  })

  // Form state management
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Toast for notifications
  const { toast } = useToast()

  /**
   * Handle input changes and update form state
   */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    // Clear the specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }

    // Reset success state when form is modified after submission
    if (isSuccess) {
      setIsSuccess(false)
    }

    setFormData(prev => ({ ...prev, [name]: value }))
  }

  /**
   * Handle radio group change for feedback type
   */
  const handleTypeChange = (value: string) => {
    // Clear the type error when user selects a new type
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: undefined }))
    }

    setFormData(prev => ({ ...prev, type: value as FeedbackType }))
  }

  /**
   * Validate form data before submission
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Please select a feedback type"
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters"
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    // Update error state
    setErrors(newErrors)

    // Return true if no errors
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Don't submit if already submitting
    if (isSubmitting) return

    // Validate form data
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Submit feedback using server action
      const result = await submitFeedbackAction(formData)

      if (result.isSuccess) {
        // Show success message
        setIsSuccess(true)
        toast({
          title: "Feedback Submitted",
          description: result.message,
          variant: "default"
        })

        // Reset form
        setFormData({
          name: "",
          email: "",
          type: FeedbackType.GENERAL,
          subject: "",
          message: ""
        })
      } else {
        // Show error message
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      // Show error message for unexpected errors
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Send us Feedback</CardTitle>
        <CardDescription>
          We value your input! Please share your thoughts, report bugs, or
          suggest features to help us improve AttendMe.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. John Smith"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Feedback Type */}
          <div className="space-y-2">
            <Label>Feedback Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={handleTypeChange}
              className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FeedbackType.GENERAL} id="general" />
                <Label htmlFor="general" className="cursor-pointer">
                  General
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FeedbackType.BUG} id="bug" />
                <Label htmlFor="bug" className="cursor-pointer">
                  Bug Report
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FeedbackType.FEATURE} id="feature" />
                <Label htmlFor="feature" className="cursor-pointer">
                  Feature Request
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={FeedbackType.QUESTION} id="question" />
                <Label htmlFor="question" className="cursor-pointer">
                  Question
                </Label>
              </div>
            </RadioGroup>
            {errors.type && (
              <p className="text-destructive text-sm">{errors.type}</p>
            )}
          </div>

          {/* Feedback Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief description of your feedback"
                className={errors.subject ? "border-destructive" : ""}
              />
              {errors.subject && (
                <p className="text-destructive text-sm">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please provide details about your feedback, including steps to reproduce if reporting a bug."
                rows={6}
                className={errors.message ? "border-destructive" : ""}
              />
              {errors.message && (
                <p className="text-destructive text-sm">{errors.message}</p>
              )}
            </div>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="flex items-start rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <CheckCircle className="mr-2 mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium">Thank you for your feedback!</p>
                <p>We appreciate your input and will review it shortly.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Back
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
