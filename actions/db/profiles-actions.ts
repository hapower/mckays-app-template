/**
 * Server actions for managing user profiles in the database
 * 
 * This file provides CRUD operations for user profiles, allowing the application
 * to create, retrieve, update, and delete user profile information. These actions
 * handle basic user data as well as subscription/membership status.
 * 
 * @module actions/db/profiles-actions
 */

"use server"

import { db } from "@/db/db"
import {
  InsertProfile,
  SelectProfile,
  profilesTable
} from "@/db/schema/profiles-schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"

/**
 * Creates a new user profile in the database
 * 
 * @param profile - The profile data to insert
 * @returns ActionState with the created profile or error message
 */
export async function createProfileAction(
  profile: InsertProfile
): Promise<ActionState<SelectProfile>> {
  try {
    // Check if profile already exists to avoid duplicates
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, profile.userId)
    })

    if (existingProfile) {
      return {
        isSuccess: true,
        message: "Profile already exists",
        data: existingProfile
      }
    }
    
    const [newProfile] = await db.insert(profilesTable).values(profile).returning()
    
    return {
      isSuccess: true,
      message: "Profile created successfully",
      data: newProfile
    }
  } catch (error) {
    console.error("Error creating profile:", error)
    return { isSuccess: false, message: "Failed to create profile" }
  }
}

/**
 * Retrieves a user profile by user ID
 * 
 * @param userId - The ID of the user whose profile to retrieve
 * @returns ActionState with the profile or error message
 */
export async function getProfileByUserIdAction(
  userId: string
): Promise<ActionState<SelectProfile | undefined>> {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })
    
    if (!profile) {
      return { 
        isSuccess: false, 
        message: "Profile not found" 
      }
    }
    
    return {
      isSuccess: true,
      message: "Profile retrieved successfully",
      data: profile
    }
  } catch (error) {
    console.error("Error getting profile by user ID:", error)
    return { isSuccess: false, message: "Failed to get profile" }
  }
}

/**
 * Retrieves all profiles (admin function)
 * 
 * @returns ActionState with array of profiles or error message
 */
export async function getAllProfilesAction(): Promise<ActionState<SelectProfile[]>> {
  try {
    const profiles = await db.query.profiles.findMany()
    
    return {
      isSuccess: true,
      message: "All profiles retrieved successfully",
      data: profiles
    }
  } catch (error) {
    console.error("Error getting all profiles:", error)
    return { isSuccess: false, message: "Failed to get profiles" }
  }
}

/**
 * Updates a profile by its ID
 * 
 * @param id - The UUID of the profile to update
 * @param data - The partial profile data to update
 * @returns ActionState with the updated profile or error message
 */
export async function updateProfileAction(
  id: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(profilesTable.id, id))
      .returning()
    
    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found" }
    }
    
    return {
      isSuccess: true,
      message: "Profile updated successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

/**
 * Updates a profile by user ID
 * 
 * @param userId - The ID of the user whose profile to update
 * @param data - The partial profile data to update
 * @returns ActionState with the updated profile or error message
 */
export async function updateProfileByUserIdAction(
  userId: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(profilesTable.userId, userId))
      .returning()
    
    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found" }
    }
    
    return {
      isSuccess: true,
      message: "Profile updated successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating profile by user ID:", error)
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

/**
 * Updates a profile by Stripe customer ID
 * Used for webhook integration to update membership status
 * 
 * @param stripeCustomerId - The Stripe customer ID
 * @param data - The partial profile data to update
 * @returns ActionState with the updated profile or error message
 */
export async function updateProfileByStripeCustomerIdAction(
  stripeCustomerId: string,
  data: Partial<InsertProfile>
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(profilesTable.stripeCustomerId, stripeCustomerId))
      .returning()
    
    if (!updatedProfile) {
      return { 
        isSuccess: false, 
        message: "Profile not found with the specified Stripe customer ID" 
      }
    }
    
    return {
      isSuccess: true,
      message: "Profile updated successfully via Stripe customer ID",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating profile by Stripe customer ID:", error)
    return { isSuccess: false, message: "Failed to update profile" }
  }
}

/**
 * Updates a user's membership level
 * 
 * @param userId - The ID of the user
 * @param membership - The new membership level
 * @returns ActionState with the updated profile or error message
 */
export async function updateMembershipAction(
  userId: string,
  membership: SelectProfile["membership"]
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set({
        membership,
        updatedAt: new Date()
      })
      .where(eq(profilesTable.userId, userId))
      .returning()
    
    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found" }
    }
    
    return {
      isSuccess: true,
      message: `Membership updated to ${membership} successfully`,
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating membership:", error)
    return { isSuccess: false, message: "Failed to update membership" }
  }
}

/**
 * Deletes a profile by ID
 * 
 * @param id - The UUID of the profile to delete
 * @returns ActionState with void or error message
 */
export async function deleteProfileAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Profile deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting profile:", error)
    return { isSuccess: false, message: "Failed to delete profile" }
  }
}

/**
 * Deletes a profile by user ID
 * 
 * @param userId - The ID of the user whose profile to delete
 * @returns ActionState with void or error message
 */
export async function deleteProfileByUserIdAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(profilesTable).where(eq(profilesTable.userId, userId))
    
    return {
      isSuccess: true,
      message: "Profile deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting profile by user ID:", error)
    return { isSuccess: false, message: "Failed to delete profile" }
  }
}

/**
 * Checks if a user has an active paid membership
 * 
 * @param userId - The ID of the user to check
 * @returns ActionState with boolean indicating paid status
 */
export async function checkPaidMembershipAction(
  userId: string
): Promise<ActionState<boolean>> {
  try {
    const profile = await db.query.profiles.findFirst({
      where: eq(profilesTable.userId, userId)
    })
    
    if (!profile) {
      return { 
        isSuccess: false, 
        message: "Profile not found" 
      }
    }
    
    // Check if membership is either pro or student
    const isPaid = profile.membership === "pro" || profile.membership === "student"
    
    return {
      isSuccess: true,
      message: isPaid ? "User has paid membership" : "User does not have paid membership",
      data: isPaid
    }
  } catch (error) {
    console.error("Error checking paid membership:", error)
    return { isSuccess: false, message: "Failed to check membership status" }
  }
}

/**
 * Updates a user's preferred specialty
 * 
 * @param userId - The ID of the user
 * @param specialty - The preferred specialty
 * @returns ActionState with the updated profile or error message
 */
export async function updatePreferredSpecialtyAction(
  userId: string,
  specialty: string
): Promise<ActionState<SelectProfile>> {
  try {
    const [updatedProfile] = await db
      .update(profilesTable)
      .set({
        specialty,
        updatedAt: new Date()
      })
      .where(eq(profilesTable.userId, userId))
      .returning()
    
    if (!updatedProfile) {
      return { isSuccess: false, message: "Profile not found" }
    }
    
    return {
      isSuccess: true,
      message: "Preferred specialty updated successfully",
      data: updatedProfile
    }
  } catch (error) {
    console.error("Error updating preferred specialty:", error)
    return { isSuccess: false, message: "Failed to update preferred specialty" }
  }
}
