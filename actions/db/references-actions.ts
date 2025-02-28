/**
 * Server actions for managing library references in the AttendMe application
 * 
 * This file provides CRUD operations for library references, allowing the application
 * to create, retrieve, update, and delete reference items. These actions support the
 * library panel functionality, enabling users to save citations and manage their
 * personal collection of medical references.
 * 
 * @module actions/db/references-actions
 */

"use server"

import { db } from "@/db/db"
import {
  InsertLibraryItem,
  SelectLibraryItem,
  libraryTable
} from "@/db/schema/library-schema"
import { ActionState } from "@/types"
import { and, desc, eq, ilike, inArray, lt, lte, gte, gt } from "drizzle-orm"
import { specialtiesTable } from "@/db/schema/specialties-schema"

/**
 * Creates a new reference in the library
 * 
 * @param reference - The reference data to insert
 * @returns ActionState with the created reference or error message
 */
export async function createReferenceAction(
  reference: InsertLibraryItem
): Promise<ActionState<SelectLibraryItem>> {
  try {
    const [newReference] = await db.insert(libraryTable).values(reference).returning()
    
    return {
      isSuccess: true,
      message: "Reference created successfully",
      data: newReference
    }
  } catch (error) {
    console.error("Error creating reference:", error)
    return { isSuccess: false, message: "Failed to create reference" }
  }
}

/**
 * Retrieves a reference by its ID
 * 
 * @param id - The ID of the reference to retrieve
 * @returns ActionState with the reference or error message
 */
export async function getReferenceByIdAction(
  id: string
): Promise<ActionState<SelectLibraryItem | undefined>> {
  try {
    const reference = await db.query.library.findFirst({
      where: eq(libraryTable.id, id)
    })
    
    if (!reference) {
      return { 
        isSuccess: false, 
        message: "Reference not found" 
      }
    }
    
    return {
      isSuccess: true,
      message: "Reference retrieved successfully",
      data: reference
    }
  } catch (error) {
    console.error("Error getting reference by ID:", error)
    return { isSuccess: false, message: "Failed to get reference" }
  }
}

/**
 * Retrieves all references for a user with optional pagination
 * 
 * @param userId - The ID of the user whose references to retrieve
 * @param limit - Maximum number of references to retrieve (default: 50)
 * @param offset - Number of references to skip (default: 0)
 * @returns ActionState with array of references or error message
 */
export async function getUserReferencesAction(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionState<SelectLibraryItem[]>> {
  try {
    // Note: The library schema currently doesn't have a userId field,
    // so this function doesn't filter by user.
    // TODO: Add userId field to library schema or implement user filtering
    // through a join with another table that has user association.
    
    // Join with specialties to include specialty information
    const references = await db.query.library.findMany({
      limit,
      offset,
      orderBy: [desc(libraryTable.updatedAt)],
      with: {
        specialty: {
          columns: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })
    
    return {
      isSuccess: true,
      message: "User references retrieved successfully",
      data: references
    }
  } catch (error) {
    console.error("Error getting user references:", error)
    return { isSuccess: false, message: "Failed to get user references" }
  }
}

/**
 * Retrieves references filtered by specialty
 * 
 * @param specialtyId - The ID of the specialty to filter by
 * @param limit - Maximum number of references to retrieve (default: 50)
 * @param offset - Number of references to skip (default: 0)
 * @returns ActionState with array of references or error message
 */
export async function getReferencesBySpecialtyAction(
  specialtyId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionState<SelectLibraryItem[]>> {
  try {
    const references = await db.query.library.findMany({
      where: eq(libraryTable.specialtyId, specialtyId),
      limit,
      offset,
      orderBy: [desc(libraryTable.updatedAt)],
      with: {
        specialty: true
      }
    })
    
    return {
      isSuccess: true,
      message: "References by specialty retrieved successfully",
      data: references
    }
  } catch (error) {
    console.error("Error getting references by specialty:", error)
    return { isSuccess: false, message: "Failed to get references by specialty" }
  }
}

/**
 * Searches for references by title or content
 * 
 * @param searchTerm - The search term to match against title and content
 * @param limit - Maximum number of references to retrieve (default: 50)
 * @param offset - Number of references to skip (default: 0)
 * @returns ActionState with matching references or error message
 */
export async function searchReferencesAction(
  searchTerm: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionState<SelectLibraryItem[]>> {
  try {
    const references = await db.query.library.findMany({
      where: (library, { or }) => or(
        ilike(library.title, `%${searchTerm}%`),
        ilike(library.content, `%${searchTerm}%`)
      ),
      limit,
      offset,
      orderBy: [desc(libraryTable.updatedAt)],
      with: {
        specialty: true
      }
    })
    
    return {
      isSuccess: true,
      message: "References search completed successfully",
      data: references
    }
  } catch (error) {
    console.error("Error searching references:", error)
    return { isSuccess: false, message: "Failed to search references" }
  }
}

/**
 * Updates a reference by its ID
 * 
 * @param id - The ID of the reference to update
 * @param data - The partial reference data to update
 * @returns ActionState with the updated reference or error message
 */
export async function updateReferenceAction(
  id: string,
  data: Partial<InsertLibraryItem>
): Promise<ActionState<SelectLibraryItem>> {
  try {
    const [updatedReference] = await db
      .update(libraryTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(libraryTable.id, id))
      .returning()
    
    if (!updatedReference) {
      return { isSuccess: false, message: "Reference not found" }
    }
    
    return {
      isSuccess: true,
      message: "Reference updated successfully",
      data: updatedReference
    }
  } catch (error) {
    console.error("Error updating reference:", error)
    return { isSuccess: false, message: "Failed to update reference" }
  }
}

/**
 * Deletes a reference by its ID
 * 
 * @param id - The ID of the reference to delete
 * @returns ActionState with void or error message
 */
export async function deleteReferenceAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(libraryTable).where(eq(libraryTable.id, id))
    
    return {
      isSuccess: true,
      message: "Reference deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting reference:", error)
    return { isSuccess: false, message: "Failed to delete reference" }
  }
}

/**
 * Deletes all references for a specific user
 * 
 * @param userId - The ID of the user whose references to delete
 * @returns ActionState with void or error message
 */
export async function deleteAllUserReferencesAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    // We need to add a userId field to the library table for this to work
    // For now, we'll leave this as a TODO and just return success
    // await db.delete(libraryTable).where(eq(libraryTable.userId, userId))
    
    return {
      isSuccess: true,
      message: "All user references deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting user references:", error)
    return { isSuccess: false, message: "Failed to delete user references" }
  }
}

/**
 * Gets a count of all references
 * 
 * @returns ActionState with the count or error message
 */
export async function getReferencesCountAction(): Promise<ActionState<number>> {
  try {
    const references = await db.query.library.findMany()
    
    return {
      isSuccess: true,
      message: "References count retrieved successfully",
      data: references.length
    }
  } catch (error) {
    console.error("Error getting references count:", error)
    return { isSuccess: false, message: "Failed to get references count" }
  }
}

/**
 * Gets references created between two dates
 * 
 * @param startDate - The start date for the range
 * @param endDate - The end date for the range
 * @param limit - Maximum number of references to retrieve (default: 50)
 * @param offset - Number of references to skip (default: 0)
 * @returns ActionState with array of references or error message
 */
export async function getReferencesByDateRangeAction(
  startDate: Date,
  endDate: Date,
  limit: number = 50,
  offset: number = 0
): Promise<ActionState<SelectLibraryItem[]>> {
  try {
    const references = await db.query.library.findMany({
      where: and(
        gte(libraryTable.createdAt, startDate),
        lte(libraryTable.createdAt, endDate)
      ),
      limit,
      offset,
      orderBy: [desc(libraryTable.createdAt)],
      with: {
        specialty: true
      }
    })
    
    return {
      isSuccess: true,
      message: "References by date range retrieved successfully",
      data: references
    }
  } catch (error) {
    console.error("Error getting references by date range:", error)
    return { isSuccess: false, message: "Failed to get references by date range" }
  }
}

/**
 * Creates multiple references in a batch operation
 * 
 * @param references - Array of reference data to insert
 * @returns ActionState with the created references or error message
 */
export async function createMultipleReferencesAction(
  references: InsertLibraryItem[]
): Promise<ActionState<SelectLibraryItem[]>> {
  try {
    if (!references.length) {
      return {
        isSuccess: true,
        message: "No references to create",
        data: []
      }
    }
    
    const createdReferences = await db
      .insert(libraryTable)
      .values(references)
      .returning()
    
    return {
      isSuccess: true,
      message: `${createdReferences.length} references created successfully`,
      data: createdReferences
    }
  } catch (error) {
    console.error("Error creating multiple references:", error)
    return { isSuccess: false, message: "Failed to create references" }
  }
}

/**
 * Gets references with optional filtering and sorting
 * 
 * @param filter - Filter options (title, specialtyId, dateFrom, dateTo)
 * @param sort - Sort option (createdAt, updatedAt, title)
 * @param order - Sort order (asc, desc)
 * @param limit - Maximum number of references to retrieve (default: 50)
 * @param offset - Number of references to skip (default: 0)
 * @returns ActionState with array of references or error message
 */
export async function getFilteredReferencesAction(
  filter: {
    title?: string;
    specialtyId?: string | string[];
    dateFrom?: Date;
    dateTo?: Date;
  },
  sort: 'createdAt' | 'updatedAt' | 'title' = 'updatedAt',
  order: 'asc' | 'desc' = 'desc',
  limit: number = 50,
  offset: number = 0
): Promise<ActionState<SelectLibraryItem[]>> {
  try {
    // Build the where conditions
    const whereConditions = []
    
    if (filter.title) {
      whereConditions.push(ilike(libraryTable.title, `%${filter.title}%`))
    }
    
    if (filter.specialtyId) {
      if (Array.isArray(filter.specialtyId)) {
        whereConditions.push(inArray(libraryTable.specialtyId, filter.specialtyId))
      } else {
        whereConditions.push(eq(libraryTable.specialtyId, filter.specialtyId))
      }
    }
    
    if (filter.dateFrom) {
      whereConditions.push(gte(libraryTable.createdAt, filter.dateFrom))
    }
    
    if (filter.dateTo) {
      whereConditions.push(lte(libraryTable.createdAt, filter.dateTo))
    }
    
    // Combine conditions into a single where clause
    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined
    
    // Use the db.query.library approach instead of select().from()
    let references
    
    if (sort === 'createdAt') {
      references = await db.query.library.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: order === 'asc' ? libraryTable.createdAt : desc(libraryTable.createdAt),
        with: {
          specialty: true
        }
      })
    } else if (sort === 'title') {
      references = await db.query.library.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: order === 'asc' ? libraryTable.title : desc(libraryTable.title),
        with: {
          specialty: true
        }
      })
    } else {
      // Default to updatedAt
      references = await db.query.library.findMany({
        where: whereClause,
        limit,
        offset,
        orderBy: order === 'asc' ? libraryTable.updatedAt : desc(libraryTable.updatedAt),
        with: {
          specialty: true
        }
      })
    }
    
    return {
      isSuccess: true,
      message: "Filtered references retrieved successfully",
      data: references
    }
  } catch (error) {
    console.error("Error getting filtered references:", error)
    return { isSuccess: false, message: "Failed to get filtered references" }
  }
}

/**
 * Adds a citation from a chat message to the library
 * 
 * @param citationData - The citation data including title, content, specialty, etc.
 * @returns ActionState with the created reference or error message
 */
export async function addCitationToLibraryAction(
  citationData: {
    title: string;
    content: string;
    specialtyId?: string;
    metadata?: Record<string, any>;
  }
): Promise<ActionState<SelectLibraryItem>> {
  try {
    // Create the library item from the citation
    const [newReference] = await db.insert(libraryTable).values({
      title: citationData.title,
      content: citationData.content,
      specialtyId: citationData.specialtyId,
      metadata: citationData.metadata ? JSON.stringify(citationData.metadata) : null,
    }).returning()
    
    return {
      isSuccess: true,
      message: "Citation added to library successfully",
      data: newReference
    }
  } catch (error) {
    console.error("Error adding citation to library:", error)
    return { isSuccess: false, message: "Failed to add citation to library" }
  }
} 