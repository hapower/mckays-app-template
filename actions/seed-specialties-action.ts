/**
 * Specialty Seed Actions
 * 
 * This module provides server actions for seeding the database with medical specialty data.
 * It handles checking if specialties already exist, adding new specialties, and provides
 * options for development environments to reset the specialty data if needed.
 * 
 * These actions are typically used during application initialization or for
 * development/testing purposes to ensure the database has the required specialty data.
 * 
 * @module actions/seed-specialties-action
 */

"use server"

import { db } from "@/db/db"
import { specialtiesTable, SelectSpecialty } from "@/db/schema"
import { specialtySeedData } from "@/db/seed-data/specialties"
import { ActionState } from "@/types"
import { count } from "drizzle-orm"

/**
 * Seeds the database with medical specialties if they don't already exist
 * 
 * This action checks if specialties already exist in the database and adds the
 * seed specialties if none are found. It's safe to call multiple times as it
 * will not duplicate specialties.
 * 
 * @returns ActionState with the result of the operation
 */
export async function seedSpecialtiesAction(): Promise<ActionState<{
  added: number;
  existing: number;
}>> {
  try {
    // First, check if specialties already exist
    const specialtyCount = await db
      .select({ value: count() })
      .from(specialtiesTable)
      .then(result => result[0].value);
    
    // If specialties already exist, return without adding more
    if (specialtyCount > 0) {
      console.log(`Specialties seeding skipped: ${specialtyCount} specialties already exist`);
      return {
        isSuccess: true,
        message: `${specialtyCount} specialties already exist in the database`,
        data: {
          added: 0,
          existing: specialtyCount
        }
      };
    }
    
    // No specialties exist, so add them from the seed data
    console.log(`Adding ${specialtySeedData.length} specialties to the database...`);
    
    // Insert the specialties in batches to avoid potential issues with large inserts
    const batchSize = 10;
    let addedCount = 0;
    
    for (let i = 0; i < specialtySeedData.length; i += batchSize) {
      const batch = specialtySeedData.slice(i, i + batchSize);
      
      // Insert the batch
      const result = await db.insert(specialtiesTable).values(batch).returning();
      addedCount += result.length;
      
      console.log(`Added batch of ${result.length} specialties (total: ${addedCount})`);
    }
    
    return {
      isSuccess: true,
      message: `Successfully added ${addedCount} specialties to the database`,
      data: {
        added: addedCount,
        existing: 0
      }
    };
  } catch (error) {
    console.error("Error seeding specialties:", error);
    
    return {
      isSuccess: false,
      message: error instanceof Error 
        ? `Failed to seed specialties: ${error.message}`
        : "Failed to seed specialties due to an unknown error"
    };
  }
}

/**
 * Gets all available specialties from the seed data
 * 
 * This action returns the specialty seed data without modifying the database.
 * It's useful for previewing the specialties that would be added during seeding.
 * 
 * @returns ActionState with the specialty seed data
 */
export async function getSpecialtySeedDataAction(): Promise<ActionState<typeof specialtySeedData>> {
  try {
    return {
      isSuccess: true,
      message: `Retrieved ${specialtySeedData.length} specialty seed items`,
      data: specialtySeedData
    };
  } catch (error) {
    console.error("Error getting specialty seed data:", error);
    
    return {
      isSuccess: false,
      message: "Failed to get specialty seed data"
    };
  }
}

/**
 * Resets the specialties in the database (DEVELOPMENT USE ONLY)
 * 
 * This action removes all existing specialties and re-seeds the database.
 * It should only be used in development environments for testing purposes.
 * 
 * @returns ActionState with the result of the operation
 */
export async function resetAndSeedSpecialtiesAction(): Promise<ActionState<{
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
    
    // First, delete all existing specialties
    console.log("Removing all existing specialties...");
    const deleteResult = await db.delete(specialtiesTable).returning();
    const removedCount = deleteResult.length;
    console.log(`Removed ${removedCount} existing specialties`);
    
    // Now, add the seed specialties
    console.log(`Adding ${specialtySeedData.length} specialties to the database...`);
    const addResult = await db.insert(specialtiesTable).values(specialtySeedData).returning();
    const addedCount = addResult.length;
    console.log(`Added ${addedCount} specialties`);
    
    return {
      isSuccess: true,
      message: `Successfully reset and seeded specialties (removed ${removedCount}, added ${addedCount})`,
      data: {
        removed: removedCount,
        added: addedCount
      }
    };
  } catch (error) {
    console.error("Error resetting and seeding specialties:", error);
    
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to reset and seed specialties: ${error.message}`
        : "Failed to reset and seed specialties due to an unknown error"
    };
  }
}

/**
 * Checks if the database has the required specialties
 * 
 * This action verifies if the database contains the minimum required specialties
 * needed for the application to function correctly.
 * 
 * @param minimumCount - The minimum number of specialties required (default: 5)
 * @returns ActionState with the verification result
 */
export async function verifySpecialtiesExistAction(
  minimumCount: number = 5
): Promise<ActionState<{
  exists: boolean;
  count: number;
}>> {
  try {
    // Get the count of specialties
    const specialtyCount = await db
      .select({ value: count() })
      .from(specialtiesTable)
      .then(result => result[0].value);
    
    const exists = specialtyCount >= minimumCount;
    
    return {
      isSuccess: true,
      message: exists
        ? `Database has ${specialtyCount} specialties (minimum: ${minimumCount})`
        : `Database needs seeding: only ${specialtyCount} specialties exist (minimum: ${minimumCount})`,
      data: {
        exists,
        count: specialtyCount
      }
    };
  } catch (error) {
    console.error("Error verifying specialties exist:", error);
    
    return {
      isSuccess: false,
      message: "Failed to verify if specialties exist"
    };
  }
} 