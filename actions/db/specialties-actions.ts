/*
<ai_context>
Contains server actions related to medical specialties in the DB.
These actions provide CRUD operations for managing specialty records.
</ai_context>
*/

"use server"

import { db } from "@/db/db"
import { 
  InsertSpecialty, 
  SelectSpecialty, 
  specialtiesTable,
  specialtyTypeEnum
} from "@/db/schema/specialties-schema"
import { ActionState } from "@/types"
import { and, asc, desc, eq, inArray, like } from "drizzle-orm"

/**
 * Creates a new medical specialty record in the database.
 * 
 * @param specialty - The specialty data to insert
 * @returns ActionState with the created specialty or error message
 */
export async function createSpecialtyAction(
  specialty: InsertSpecialty
): Promise<ActionState<SelectSpecialty>> {
  try {
    const [newSpecialty] = await db.insert(specialtiesTable).values(specialty).returning()
    return {
      isSuccess: true,
      message: "Specialty created successfully",
      data: newSpecialty
    }
  } catch (error) {
    console.error("Error creating specialty:", error)
    return { isSuccess: false, message: "Failed to create specialty" }
  }
}

/**
 * Retrieves all medical specialties from the database.
 * 
 * @param alphabetical - Whether to sort alphabetically by name (default: true)
 * @returns ActionState with array of specialties or error message
 */
export async function getSpecialtiesAction(
  alphabetical: boolean = true
): Promise<ActionState<SelectSpecialty[]>> {
  try {
    const specialties = await db.query.specialties.findMany({
      orderBy: alphabetical ? [asc(specialtiesTable.name)] : [desc(specialtiesTable.updatedAt)]
    })
    
    return {
      isSuccess: true,
      message: "Specialties retrieved successfully",
      data: specialties
    }
  } catch (error) {
    console.error("Error getting specialties:", error)
    return { isSuccess: false, message: "Failed to get specialties" }
  }
}

/**
 * Retrieves a single medical specialty by ID.
 * 
 * @param id - The UUID of the specialty to retrieve
 * @returns ActionState with the specialty or error message
 */
export async function getSpecialtyByIdAction(
  id: string
): Promise<ActionState<SelectSpecialty | undefined>> {
  try {
    const specialty = await db.query.specialties.findFirst({
      where: eq(specialtiesTable.id, id)
    })
    
    return {
      isSuccess: true,
      message: specialty ? "Specialty retrieved successfully" : "Specialty not found",
      data: specialty
    }
  } catch (error) {
    console.error("Error getting specialty:", error)
    return { isSuccess: false, message: "Failed to get specialty" }
  }
}

/**
 * Updates an existing medical specialty record.
 * 
 * @param id - The UUID of the specialty to update
 * @param data - The partial specialty data to update
 * @returns ActionState with the updated specialty or error message
 */
export async function updateSpecialtyAction(
  id: string,
  data: Partial<InsertSpecialty>
): Promise<ActionState<SelectSpecialty>> {
  try {
    const [updatedSpecialty] = await db
      .update(specialtiesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(specialtiesTable.id, id))
      .returning()
      
    if (!updatedSpecialty) {
      return { isSuccess: false, message: "Specialty not found" }
    }

    return {
      isSuccess: true,
      message: "Specialty updated successfully",
      data: updatedSpecialty
    }
  } catch (error) {
    console.error("Error updating specialty:", error)
    return { isSuccess: false, message: "Failed to update specialty" }
  }
}

/**
 * Deletes a medical specialty record from the database.
 * 
 * @param id - The UUID of the specialty to delete
 * @returns ActionState with void or error message
 */
export async function deleteSpecialtyAction(id: string): Promise<ActionState<void>> {
  try {
    await db.delete(specialtiesTable).where(eq(specialtiesTable.id, id))
    return {
      isSuccess: true,
      message: "Specialty deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting specialty:", error)
    return { isSuccess: false, message: "Failed to delete specialty" }
  }
}

/**
 * Retrieves specialties filtered by type.
 * 
 * @param types - Array of specialty types to include
 * @param alphabetical - Whether to sort alphabetically (default: true)
 * @returns ActionState with filtered specialties array
 */
export async function getSpecialtiesByTypeAction(
  types: (typeof specialtyTypeEnum.enumValues)[number][],
  alphabetical: boolean = true
): Promise<ActionState<SelectSpecialty[]>> {
  try {
    const specialties = await db.query.specialties.findMany({
      where: inArray(specialtiesTable.type, types),
      orderBy: alphabetical ? [asc(specialtiesTable.name)] : [desc(specialtiesTable.updatedAt)]
    })
    
    return {
      isSuccess: true,
      message: "Specialties retrieved successfully by type",
      data: specialties
    }
  } catch (error) {
    console.error("Error getting specialties by type:", error)
    return { isSuccess: false, message: "Failed to get specialties by type" }
  }
}

/**
 * Searches for specialties by name.
 * 
 * @param searchTerm - The search term to match against specialty names
 * @returns ActionState with matching specialties
 */
export async function searchSpecialtiesAction(
  searchTerm: string
): Promise<ActionState<SelectSpecialty[]>> {
  try {
    const sanitizedTerm = searchTerm.trim()
    
    if (!sanitizedTerm) {
      return await getSpecialtiesAction()
    }
    
    const specialties = await db.query.specialties.findMany({
      where: like(specialtiesTable.name, `%${sanitizedTerm}%`),
      orderBy: [asc(specialtiesTable.name)]
    })
    
    return {
      isSuccess: true,
      message: "Search results retrieved successfully",
      data: specialties
    }
  } catch (error) {
    console.error("Error searching specialties:", error)
    return { isSuccess: false, message: "Failed to search specialties" }
  }
}

/**
 * Gets medical and surgical specialties in separate groups.
 * This supports the UI requirement for showing medical specialties
 * on top, followed by surgical specialties.
 * 
 * @returns ActionState with an object containing medical and surgical specialties
 */
export async function getGroupedSpecialtiesAction(): Promise<
  ActionState<{
    medical: SelectSpecialty[];
    surgical: SelectSpecialty[];
  }>
> {
  try {
    // Define which types are considered medical vs. surgical
    const medicalTypes = [
      "internal_medicine", 
      "pediatrics", 
      "dermatology", 
      "neurology", 
      "psychiatry", 
      "emergency_medicine"
    ];
    
    const surgicalTypes = [
      "cardiology", 
      "orthopedics", 
      "oncology"
    ];
    
    // Get all specialties
    const { data: allSpecialties, isSuccess } = await getSpecialtiesAction(true);
    
    if (!isSuccess || !allSpecialties) {
      throw new Error("Failed to retrieve specialties");
    }
    
    // Group specialties by type
    const medicalSpecialties = allSpecialties.filter(specialty => 
      medicalTypes.includes(specialty.type)
    );
    
    const surgicalSpecialties = allSpecialties.filter(specialty => 
      surgicalTypes.includes(specialty.type)
    );
    
    return {
      isSuccess: true,
      message: "Grouped specialties retrieved successfully",
      data: {
        medical: medicalSpecialties,
        surgical: surgicalSpecialties
      }
    }
  } catch (error) {
    console.error("Error getting grouped specialties:", error)
    return { isSuccess: false, message: "Failed to get grouped specialties" }
  }
}

/**
 * Creates multiple specialty records in a single transaction.
 * Useful for initializing the system with default specialties.
 * 
 * @param specialties - Array of specialty data to insert
 * @returns ActionState with the created specialties
 */
export async function createMultipleSpecialtiesAction(
  specialties: InsertSpecialty[]
): Promise<ActionState<SelectSpecialty[]>> {
  try {
    if (!specialties.length) {
      return {
        isSuccess: true,
        message: "No specialties to create",
        data: []
      }
    }
    
    const createdSpecialties = await db.insert(specialtiesTable)
      .values(specialties)
      .returning();
    
    return {
      isSuccess: true,
      message: `${createdSpecialties.length} specialties created successfully`,
      data: createdSpecialties
    }
  } catch (error) {
    console.error("Error creating multiple specialties:", error)
    return { isSuccess: false, message: "Failed to create specialties" }
  }
}

/**
 * Seeds the database with default specialties if none exist.
 * This is useful for initial application setup.
 * 
 * @returns ActionState with the created specialties or existing count
 */
export async function seedDefaultSpecialtiesAction(): Promise<
  ActionState<{ created: SelectSpecialty[] } | { existing: number }>
> {
  try {
    // Check if specialties already exist
    const { data: existingSpecialties } = await getSpecialtiesAction();
    
    if (existingSpecialties && existingSpecialties.length > 0) {
      return {
        isSuccess: true,
        message: `${existingSpecialties.length} specialties already exist`,
        data: { existing: existingSpecialties.length }
      }
    }
    
    // Define default specialties
    const defaultSpecialties: InsertSpecialty[] = [
      {
        name: "Internal Medicine",
        description: "Diagnosis and treatment of adult diseases",
        type: "internal_medicine"
      },
      {
        name: "Cardiology",
        description: "Heart and cardiovascular system",
        type: "cardiology"
      },
      {
        name: "Pediatrics",
        description: "Medical care for infants, children, and adolescents",
        type: "pediatrics"
      },
      {
        name: "Dermatology",
        description: "Skin, hair, and nail disorders",
        type: "dermatology"
      },
      {
        name: "Neurology",
        description: "Disorders of the nervous system",
        type: "neurology"
      },
      {
        name: "Orthopedics",
        description: "Musculoskeletal system conditions",
        type: "orthopedics"
      },
      {
        name: "Oncology",
        description: "Cancer diagnosis and treatment",
        type: "oncology"
      },
      {
        name: "Psychiatry",
        description: "Mental, emotional, and behavioral disorders",
        type: "psychiatry"
      },
      {
        name: "Emergency Medicine",
        description: "Acute illnesses and injuries requiring immediate attention",
        type: "emergency_medicine"
      }
    ];
    
    // Create specialties
    const result = await createMultipleSpecialtiesAction(defaultSpecialties);
    
    if (!result.isSuccess) {
      throw new Error(result.message);
    }
    
    return {
      isSuccess: true,
      message: `${result.data.length} default specialties created`,
      data: { created: result.data }
    }
  } catch (error) {
    console.error("Error seeding default specialties:", error)
    return { isSuccess: false, message: "Failed to seed default specialties" }
  }
} 