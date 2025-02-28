/**
 * Server actions for managing chat sessions in the database
 * 
 * This file provides CRUD operations for chats, allowing the application
 * to create, retrieve, update, and delete chat sessions. It handles chat
 * creation with different specialties, retrieval of user chats, and management
 * of chat data.
 * 
 * @module actions/db/chats-actions
 */

"use server"

import { db } from "@/db/db"
import {
  InsertChat,
  SelectChat,
  chatsTable
} from "@/db/schema/chats-schema"
import { ActionState } from "@/types"
import { eq, desc } from "drizzle-orm"

/**
 * Creates a new chat session in the database
 * 
 * @param chat - The chat data to insert
 * @returns ActionState with the created chat or error message
 */
export async function createChatAction(
  chat: InsertChat
): Promise<ActionState<SelectChat>> {
  try {
    // Generate a default title if none is provided
    if (!chat.title) {
      chat.title = `New Chat ${new Date().toLocaleString()}`
    }
    
    const [newChat] = await db.insert(chatsTable).values(chat).returning()
    
    return {
      isSuccess: true,
      message: "Chat created successfully",
      data: newChat
    }
  } catch (error) {
    console.error("Error creating chat:", error)
    return { isSuccess: false, message: "Failed to create chat" }
  }
}

/**
 * Retrieves a chat by its ID
 * 
 * @param id - The ID of the chat to retrieve
 * @returns ActionState with the chat or error message
 */
export async function getChatByIdAction(
  id: string
): Promise<ActionState<SelectChat | undefined>> {
  try {
    const chat = await db.query.chats.findFirst({
      where: eq(chatsTable.id, id)
    })
    
    if (!chat) {
      return { 
        isSuccess: false, 
        message: "Chat not found" 
      }
    }
    
    return {
      isSuccess: true,
      message: "Chat retrieved successfully",
      data: chat
    }
  } catch (error) {
    console.error("Error getting chat by ID:", error)
    return { isSuccess: false, message: "Failed to get chat" }
  }
}

/**
 * Retrieves all chats for a specific user
 * 
 * @param userId - The ID of the user whose chats to retrieve
 * @returns ActionState with array of chats or error message
 */
export async function getUserChatsAction(
  userId: string
): Promise<ActionState<SelectChat[]>> {
  try {
    const chats = await db.query.chats.findMany({
      where: eq(chatsTable.userId, userId),
      orderBy: [desc(chatsTable.updatedAt)]
    })
    
    return {
      isSuccess: true,
      message: "User chats retrieved successfully",
      data: chats
    }
  } catch (error) {
    console.error("Error getting user chats:", error)
    return { isSuccess: false, message: "Failed to get user chats" }
  }
}

/**
 * Retrieves all chats for a user with a specific specialty
 * 
 * @param userId - The ID of the user
 * @param specialtyId - The ID of the specialty
 * @returns ActionState with array of chats or error message
 */
export async function getUserChatsBySpecialtyAction(
  userId: string,
  specialtyId: string
): Promise<ActionState<SelectChat[]>> {
  try {
    const chats = await db.query.chats.findMany({
      where: (chats, { and, eq }) => 
        and(eq(chats.userId, userId), eq(chats.specialtyId, specialtyId)),
      orderBy: [desc(chatsTable.updatedAt)]
    })
    
    return {
      isSuccess: true,
      message: "User chats for specialty retrieved successfully",
      data: chats
    }
  } catch (error) {
    console.error("Error getting user chats by specialty:", error)
    return { isSuccess: false, message: "Failed to get user chats by specialty" }
  }
}

/**
 * Updates a chat by its ID
 * 
 * @param id - The ID of the chat to update
 * @param data - The partial chat data to update
 * @returns ActionState with the updated chat or error message
 */
export async function updateChatAction(
  id: string,
  data: Partial<InsertChat>
): Promise<ActionState<SelectChat>> {
  try {
    const [updatedChat] = await db
      .update(chatsTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(chatsTable.id, id))
      .returning()
    
    if (!updatedChat) {
      return { isSuccess: false, message: "Chat not found" }
    }
    
    return {
      isSuccess: true,
      message: "Chat updated successfully",
      data: updatedChat
    }
  } catch (error) {
    console.error("Error updating chat:", error)
    return { isSuccess: false, message: "Failed to update chat" }
  }
}

/**
 * Updates a chat's title
 * 
 * @param id - The ID of the chat
 * @param title - The new title
 * @returns ActionState with the updated chat or error message
 */
export async function updateChatTitleAction(
  id: string,
  title: string
): Promise<ActionState<SelectChat>> {
  try {
    const [updatedChat] = await db
      .update(chatsTable)
      .set({
        title,
        updatedAt: new Date()
      })
      .where(eq(chatsTable.id, id))
      .returning()
    
    if (!updatedChat) {
      return { isSuccess: false, message: "Chat not found" }
    }
    
    return {
      isSuccess: true,
      message: "Chat title updated successfully",
      data: updatedChat
    }
  } catch (error) {
    console.error("Error updating chat title:", error)
    return { isSuccess: false, message: "Failed to update chat title" }
  }
}

/**
 * Updates a chat's specialty
 * 
 * @param id - The ID of the chat
 * @param specialtyId - The new specialty ID
 * @returns ActionState with the updated chat or error message
 */
export async function updateChatSpecialtyAction(
  id: string,
  specialtyId: string | null
): Promise<ActionState<SelectChat>> {
  try {
    const [updatedChat] = await db
      .update(chatsTable)
      .set({
        specialtyId,
        updatedAt: new Date()
      })
      .where(eq(chatsTable.id, id))
      .returning()
    
    if (!updatedChat) {
      return { isSuccess: false, message: "Chat not found" }
    }
    
    return {
      isSuccess: true,
      message: "Chat specialty updated successfully",
      data: updatedChat
    }
  } catch (error) {
    console.error("Error updating chat specialty:", error)
    return { isSuccess: false, message: "Failed to update chat specialty" }
  }
}

/**
 * Deletes a chat by its ID
 * 
 * @param id - The ID of the chat to delete
 * @returns ActionState with void or error message
 */
export async function deleteChatAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(chatsTable).where(eq(chatsTable.id, id))
    
    return {
      isSuccess: true,
      message: "Chat deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting chat:", error)
    return { isSuccess: false, message: "Failed to delete chat" }
  }
}

/**
 * Deletes all chats for a specific user
 * 
 * @param userId - The ID of the user whose chats to delete
 * @returns ActionState with void or error message
 */
export async function deleteAllUserChatsAction(
  userId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(chatsTable).where(eq(chatsTable.userId, userId))
    
    return {
      isSuccess: true,
      message: "All user chats deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting user chats:", error)
    return { isSuccess: false, message: "Failed to delete user chats" }
  }
} 