/**
 * Server actions for managing chat messages in the database
 * 
 * This file provides CRUD operations for messages, allowing the application
 * to create, retrieve, update, and delete messages within chat sessions.
 * It handles both user and assistant messages, maintains conversation history,
 * and manages message content.
 * 
 * @module actions/db/messages-actions
 */

"use server"

import { db } from "@/db/db"
import {
  InsertMessage,
  SelectMessage,
  messagesTable,
  roleEnum
} from "@/db/schema/messages-schema"
import { chatsTable } from "@/db/schema/chats-schema"
import { ActionState } from "@/types"
import { eq, and, desc, asc } from "drizzle-orm"

/**
 * Creates a new message in a chat
 * 
 * @param message - The message data to insert
 * @returns ActionState with the created message or error message
 */
export async function createMessageAction(
  message: InsertMessage
): Promise<ActionState<SelectMessage>> {
  try {
    // Verify that the chat exists
    const chat = await db.query.chats.findFirst({
      where: eq(chatsTable.id, message.chatId)
    })
    
    if (!chat) {
      return { 
        isSuccess: false, 
        message: "Chat not found" 
      }
    }
    
    const [newMessage] = await db.insert(messagesTable).values(message).returning()
    
    // Update the chat's updatedAt timestamp
    await db
      .update(chatsTable)
      .set({ updatedAt: new Date() })
      .where(eq(chatsTable.id, message.chatId))
    
    return {
      isSuccess: true,
      message: "Message created successfully",
      data: newMessage
    }
  } catch (error) {
    console.error("Error creating message:", error)
    return { isSuccess: false, message: "Failed to create message" }
  }
}

/**
 * Retrieves a message by its ID
 * 
 * @param id - The ID of the message to retrieve
 * @returns ActionState with the message or error message
 */
export async function getMessageByIdAction(
  id: string
): Promise<ActionState<SelectMessage | undefined>> {
  try {
    const message = await db.query.messages.findFirst({
      where: eq(messagesTable.id, id)
    })
    
    if (!message) {
      return { 
        isSuccess: false, 
        message: "Message not found" 
      }
    }
    
    return {
      isSuccess: true,
      message: "Message retrieved successfully",
      data: message
    }
  } catch (error) {
    console.error("Error getting message by ID:", error)
    return { isSuccess: false, message: "Failed to get message" }
  }
}

/**
 * Retrieves all messages in a chat
 * 
 * @param chatId - The ID of the chat
 * @returns ActionState with array of messages or error message
 */
export async function getChatMessagesAction(
  chatId: string
): Promise<ActionState<SelectMessage[]>> {
  try {
    const messages = await db.query.messages.findMany({
      where: eq(messagesTable.chatId, chatId),
      orderBy: [asc(messagesTable.createdAt)]
    })
    
    return {
      isSuccess: true,
      message: "Chat messages retrieved successfully",
      data: messages
    }
  } catch (error) {
    console.error("Error getting chat messages:", error)
    return { isSuccess: false, message: "Failed to get chat messages" }
  }
}

/**
 * Retrieves the most recent messages in a chat with pagination
 * 
 * @param chatId - The ID of the chat
 * @param limit - Maximum number of messages to retrieve (default: 50)
 * @param offset - Number of messages to skip (default: 0)
 * @returns ActionState with array of messages or error message
 */
export async function getRecentChatMessagesAction(
  chatId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionState<SelectMessage[]>> {
  try {
    const messages = await db.query.messages.findMany({
      where: eq(messagesTable.chatId, chatId),
      orderBy: [desc(messagesTable.createdAt)],
      limit,
      offset
    })
    
    // Return in chronological order (oldest first)
    const chronologicalMessages = [...messages].reverse()
    
    return {
      isSuccess: true,
      message: "Recent chat messages retrieved successfully",
      data: chronologicalMessages
    }
  } catch (error) {
    console.error("Error getting recent chat messages:", error)
    return { isSuccess: false, message: "Failed to get recent chat messages" }
  }
}

/**
 * Retrieves the last assistant message in a chat
 * 
 * @param chatId - The ID of the chat
 * @returns ActionState with the message or error message
 */
export async function getLastAssistantMessageAction(
  chatId: string
): Promise<ActionState<SelectMessage | undefined>> {
  try {
    const messages = await db.query.messages.findMany({
      where: and(
        eq(messagesTable.chatId, chatId),
        eq(messagesTable.role, "assistant")
      ),
      orderBy: [desc(messagesTable.createdAt)],
      limit: 1
    })
    
    const message = messages[0]
    
    if (!message) {
      return { 
        isSuccess: true, 
        message: "No assistant messages found", 
        data: undefined 
      }
    }
    
    return {
      isSuccess: true,
      message: "Last assistant message retrieved successfully",
      data: message
    }
  } catch (error) {
    console.error("Error getting last assistant message:", error)
    return { isSuccess: false, message: "Failed to get last assistant message" }
  }
}

/**
 * Updates a message by its ID
 * 
 * @param id - The ID of the message to update
 * @param data - The partial message data to update
 * @returns ActionState with the updated message or error message
 */
export async function updateMessageAction(
  id: string,
  data: Partial<InsertMessage>
): Promise<ActionState<SelectMessage>> {
  try {
    const [updatedMessage] = await db
      .update(messagesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(messagesTable.id, id))
      .returning()
    
    if (!updatedMessage) {
      return { isSuccess: false, message: "Message not found" }
    }
    
    return {
      isSuccess: true,
      message: "Message updated successfully",
      data: updatedMessage
    }
  } catch (error) {
    console.error("Error updating message:", error)
    return { isSuccess: false, message: "Failed to update message" }
  }
}

/**
 * Updates a message's content
 * 
 * @param id - The ID of the message
 * @param content - The new content
 * @returns ActionState with the updated message or error message
 */
export async function updateMessageContentAction(
  id: string,
  content: string
): Promise<ActionState<SelectMessage>> {
  try {
    const [updatedMessage] = await db
      .update(messagesTable)
      .set({
        content,
        updatedAt: new Date()
      })
      .where(eq(messagesTable.id, id))
      .returning()
    
    if (!updatedMessage) {
      return { isSuccess: false, message: "Message not found" }
    }
    
    return {
      isSuccess: true,
      message: "Message content updated successfully",
      data: updatedMessage
    }
  } catch (error) {
    console.error("Error updating message content:", error)
    return { isSuccess: false, message: "Failed to update message content" }
  }
}

/**
 * Deletes a message by its ID
 * 
 * @param id - The ID of the message to delete
 * @returns ActionState with void or error message
 */
export async function deleteMessageAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(messagesTable).where(eq(messagesTable.id, id))
    
    return {
      isSuccess: true,
      message: "Message deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting message:", error)
    return { isSuccess: false, message: "Failed to delete message" }
  }
}

/**
 * Deletes all messages in a chat
 * 
 * @param chatId - The ID of the chat whose messages to delete
 * @returns ActionState with void or error message
 */
export async function deleteAllChatMessagesAction(
  chatId: string
): Promise<ActionState<void>> {
  try {
    await db.delete(messagesTable).where(eq(messagesTable.chatId, chatId))
    
    return {
      isSuccess: true,
      message: "All chat messages deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting chat messages:", error)
    return { isSuccess: false, message: "Failed to delete chat messages" }
  }
} 