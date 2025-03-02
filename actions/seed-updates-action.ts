/**
 * Update Seed Actions
 * 
 * This module provides server actions for seeding the database with medical update data.
 * It handles checking if updates already exist, adding new updates, and provides
 * options for development environments to reset the update data if needed.
 * 
 * These actions are typically used during application initialization or for
 * development/testing purposes to ensure the database has the required update data
 * for the updates panel.
 * 
 * @module actions/seed-updates-action
 */

"use server"

import { db } from "@/db/db"
import { libraryTable } from "@/db/schema"
import { updatesSeedData } from "@/db/seed-data/updates"
import { ActionState } from "@/types"
import { SQL, count, eq, sql } from "drizzle-orm"

/**
 * Seeds the database with medical updates if they don't already exist
 * 
 * This action checks if updates already exist in the database and adds the
 * seed updates if none are found. It's safe to call multiple times as it
 * will not duplicate updates.
 * 
 * @param userId - User ID to associate with the seeded updates
 * @returns ActionState with the result of the operation
 */
export async function seedUpdatesAction(
  userId: string
): Promise<ActionState<{
  added: number;
  existing: number;
}>> {
  try {
    if (!userId) {
      return {
        isSuccess: false,
        message: "User ID is required to seed updates"
      }
    }
    
    // First, check if we already have some updates/articles in the library
    // with content type "update" (we use the library table to store updates)
    const updatesCount = await db
      .select({ value: count() })
      .from(libraryTable)
      .where(sql`metadata->>'sourceType' = 'update'`)
      .then(result => result[0]?.value || 0);
    
    // If updates already exist, return without adding more
    if (updatesCount > 0) {
      console.log(`Updates seeding skipped: ${updatesCount} updates already exist`);
      return {
        isSuccess: true,
        message: `${updatesCount} updates already exist in the database`,
        data: {
          added: 0,
          existing: updatesCount
        }
      };
    }
    
    // No updates exist, so add them from the seed data
    console.log(`Adding ${updatesSeedData.length} updates to the database...`);
    
    // Transform update articles into library items
    const libraryItems = updatesSeedData.map(update => ({
      userId,
      title: update.title,
      content: update.abstract || update.title,
      specialtyId: update.specialtyId,
      metadata: JSON.stringify({
        authors: update.authors,
        journal: update.journal,
        year: update.year,
        date: update.date,
        doi: update.doi,
        url: update.url,
        sourceType: "update", // Mark as an update rather than a regular library item
        articleId: update.id
      })
    }));
    
    // Insert the updates in batches to avoid potential issues with large inserts
    const batchSize = 10;
    let addedCount = 0;
    
    for (let i = 0; i < libraryItems.length; i += batchSize) {
      const batch = libraryItems.slice(i, i + batchSize);
      
      // Insert the batch
      const result = await db.insert(libraryTable).values(batch).returning();
      addedCount += result.length;
      
      console.log(`Added batch of ${result.length} updates (total: ${addedCount})`);
    }
    
    return {
      isSuccess: true,
      message: `Successfully added ${addedCount} updates to the database`,
      data: {
        added: addedCount,
        existing: 0
      }
    };
  } catch (error) {
    console.error("Error seeding updates:", error);
    
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to seed updates: ${error.message}`
        : "Failed to seed updates due to an unknown error"
    };
  }
}

/**
 * Gets all available updates from the seed data
 * 
 * This action returns the updates seed data without modifying the database.
 * It's useful for previewing the updates that would be added during seeding.
 * 
 * @returns ActionState with the updates seed data
 */
export async function getUpdatesSeedDataAction(): Promise<ActionState<typeof updatesSeedData>> {
  try {
    return {
      isSuccess: true,
      message: `Retrieved ${updatesSeedData.length} update seed items`,
      data: updatesSeedData
    };
  } catch (error) {
    console.error("Error getting updates seed data:", error);
    
    return {
      isSuccess: false,
      message: "Failed to get updates seed data"
    };
  }
}

/**
 * Resets the updates in the database (DEVELOPMENT USE ONLY)
 * 
 * This action removes all existing updates and re-seeds the database.
 * It should only be used in development environments for testing purposes.
 * 
 * @param userId - User ID to associate with the seeded updates
 * @returns ActionState with the result of the operation
 */
export async function resetAndSeedUpdatesAction(
  userId: string
): Promise<ActionState<{
  removed: number;
  added: number;
}>> {
  try {
    // Safety check: Don't run in production
    if (process.env.NODE_ENV === "production") {
      return {
        isSuccess: false,
        message: "This action is not available in production environments"
      };
    }
    
    if (!userId) {
      return {
        isSuccess: false,
        message: "User ID is required to reset and seed updates"
      }
    }
    
    // First, delete all existing updates (items with sourceType "update")
    console.log("Removing all existing updates...");
    const deleteResult = await db
      .delete(libraryTable)
      .where(sql`metadata->>'sourceType' = 'update'`)
      .returning();
    
    const removedCount = deleteResult.length;
    console.log(`Removed ${removedCount} existing updates`);
    
    // Now, add the seed updates
    console.log(`Adding ${updatesSeedData.length} updates to the database...`);
    
    // Transform update articles into library items
    const libraryItems = updatesSeedData.map(update => ({
      userId,
      title: update.title,
      content: update.abstract || update.title,
      specialtyId: update.specialtyId,
      metadata: JSON.stringify({
        authors: update.authors,
        journal: update.journal,
        year: update.year,
        date: update.date,
        doi: update.doi,
        url: update.url,
        sourceType: "update",
        articleId: update.id
      })
    }));
    
    // Insert all updates at once
    const addResult = await db.insert(libraryTable).values(libraryItems).returning();
    const addedCount = addResult.length;
    console.log(`Added ${addedCount} updates`);
    
    return {
      isSuccess: true,
      message: `Successfully reset and seeded updates (removed ${removedCount}, added ${addedCount})`,
      data: {
        removed: removedCount,
        added: addedCount
      }
    };
  } catch (error) {
    console.error("Error resetting and seeding updates:", error);
    
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to reset and seed updates: ${error.message}`
        : "Failed to reset and seed updates due to an unknown error"
    };
  }
}

/**
 * Checks if the database has the required updates
 * 
 * This action verifies if the database contains the minimum required updates
 * needed for the application to function correctly.
 * 
 * @param minimumCount - The minimum number of updates required (default: 5)
 * @returns ActionState with the verification result
 */
export async function verifyUpdatesExistAction(
  minimumCount: number = 5
): Promise<ActionState<{
  exists: boolean;
  count: number;
}>> {
  try {
    // Get the count of updates
    const updatesCount = await db
      .select({ value: count() })
      .from(libraryTable)
      .where(sql`metadata->>'sourceType' = 'update'`)
      .then(result => result[0]?.value || 0);
    
    const exists = updatesCount >= minimumCount;
    
    return {
      isSuccess: true,
      message: exists
        ? `Database has ${updatesCount} updates (minimum: ${minimumCount})`
        : `Database needs seeding: only ${updatesCount} updates exist (minimum: ${minimumCount})`,
      data: {
        exists,
        count: updatesCount
      }
    };
  } catch (error) {
    console.error("Error verifying updates exist:", error);
    
    return {
      isSuccess: false,
      message: "Failed to verify if updates exist"
    };
  }
}

/**
 * Seeds the database with placeholder updates for a specific user
 * 
 * This action is specifically designed for adding placeholder updates
 * to a specific user's library to provide sample content upon registration.
 * 
 * @param userId - The ID of the user to create sample updates for
 * @param limit - Maximum number of sample updates to create (default: 5)
 * @returns ActionState with the result of the operation
 */
export async function seedUserPlaceholderUpdatesAction(
  userId: string,
  limit: number = 5
): Promise<ActionState<number>> {
  try {
    if (!userId) {
      return {
        isSuccess: false,
        message: "User ID is required to seed placeholder updates"
      };
    }
    
    // Select a subset of the updates seed data to use as placeholders
    const sampleUpdates = updatesSeedData
      .slice(0, Math.min(limit, updatesSeedData.length))
      .map(update => ({
        userId,
        title: update.title,
        content: update.abstract || update.title,
        specialtyId: update.specialtyId,
        metadata: JSON.stringify({
          authors: update.authors,
          journal: update.journal,
          year: update.year,
          date: update.date,
          doi: update.doi,
          url: update.url,
          sourceType: "update",
          articleId: update.id
        })
      }));
    
    // Insert the placeholder updates
    const result = await db.insert(libraryTable).values(sampleUpdates).returning();
    const addedCount = result.length;
    
    return {
      isSuccess: true,
      message: `Added ${addedCount} placeholder updates for user`,
      data: addedCount
    };
  } catch (error) {
    console.error("Error seeding placeholder updates for user:", error);
    
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to seed placeholder updates: ${error.message}`
        : "Failed to seed placeholder updates due to an unknown error"
    };
  }
} 