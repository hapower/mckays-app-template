/**
 * Feedback Form Submission Actions
 * 
 * This module provides server actions for handling feedback form submissions
 * in the AttendMe application. It allows users to submit feedback, questions,
 * and bug reports which can be processed, stored, and responded to.
 * 
 * The main action, submitFeedbackAction, validates input, processes the feedback,
 * and returns appropriate responses using the standard ActionState pattern.
 * 
 * @module actions/feedback-actions
 */

"use server"

import { ActionState } from "@/types"
import { z } from "zod"

/**
 * Feedback type enum defining the possible feedback categories
 */
export enum FeedbackType {
  GENERAL = "general",
  BUG = "bug",
  FEATURE = "feature",
  QUESTION = "question"
}

/**
 * Feedback data interface defining the structure of feedback submissions
 */
export interface FeedbackData {
  name: string
  email: string
  type: FeedbackType
  subject: string
  message: string
}

/**
 * Zod schema for validating feedback submissions
 */
const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  type: z.nativeEnum(FeedbackType, {
    errorMap: () => ({ message: "Please select a valid feedback type" })
  }),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters")
})

/**
 * Submits user feedback to the system
 * 
 * This action validates the feedback data, processes it (including sending 
 * notifications and storing in the database), and returns the result.
 * 
 * @param data - The feedback data submitted by the user
 * @returns ActionState with success/failure status and message
 */
export async function submitFeedbackAction(
  data: FeedbackData
): Promise<ActionState<void>> {
  try {
    // Validate the feedback data against the schema
    const validationResult = feedbackSchema.safeParse(data)
    
    if (!validationResult.success) {
      // Extract and format validation errors
      const errorMessages = validationResult.error.errors.map(
        error => `${error.path}: ${error.message}`
      ).join(", ")
      
      return {
        isSuccess: false,
        message: `Validation failed: ${errorMessages}`
      }
    }
    
    // At this point, data is validated and typed correctly
    const { name, email, type, subject, message } = data
    
    // TODO: Store feedback in the database
    // This would involve creating a feedback table and inserting the data
    // For MVP, we'll just log the feedback
    console.log("Feedback received:", {
      name,
      email,
      type,
      subject,
      message,
      timestamp: new Date().toISOString()
    })
    
    // TODO: Send notification email to administrators
    // This would involve setting up an email service like SendGrid or AWS SES
    // For MVP, we'll just log the notification
    console.log("Notification would be sent to administrators about new feedback")
    
    // Return success response
    return {
      isSuccess: true,
      message: "Thank you for your feedback! We'll review it shortly.",
      data: undefined
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error submitting feedback:", error)
    
    // Return failure response with a user-friendly message
    return {
      isSuccess: false,
      message: "There was an error submitting your feedback. Please try again later."
    }
  }
}

/**
 * Validates feedback data without submitting it
 * 
 * This is useful for client-side validation before submission.
 * 
 * @param data - The feedback data to validate
 * @returns ActionState with validation result
 */
export async function validateFeedbackAction(
  data: Partial<FeedbackData>
): Promise<ActionState<Record<string, string | undefined>>> {
  try {
    // Create a partial schema for validation
    const partialSchema = feedbackSchema.partial()
    const result = partialSchema.safeParse(data)
    
    if (!result.success) {
      // Extract field-specific errors
      const fieldErrors: Record<string, string | undefined> = {}
      
      result.error.errors.forEach(error => {
        const field = error.path[0].toString()
        fieldErrors[field] = error.message
      })
      
      // For validation functions, we actually want to return the errors
      // even on failure, so we'll use isSuccess: true but with errors in the data
      return {
        isSuccess: true,
        message: "Validation failed",
        data: fieldErrors
      }
    }
    
    return {
      isSuccess: true,
      message: "Validation successful",
      data: {}
    }
  } catch (error) {
    console.error("Error validating feedback:", error)
    
    return {
      isSuccess: false,
      message: "Error during validation"
    }
  }
} 