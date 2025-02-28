"use server"

import { ActionState } from "@/types"

// A simplified test function to check exports
export async function processChatMessageAction(): Promise<ActionState<string>> {
  return {
    isSuccess: true,
    message: "Test successful",
    data: "Test data"
  }
}

// Another test function
export async function generateChatTitleAction(): Promise<ActionState<string>> {
  return {
    isSuccess: true,
    message: "Title generated successfully",
    data: "Test title"
  }
}

// Export statement for debugging
console.log("AI Chat Test module loaded, exports:", Object.keys({ processChatMessageAction, generateChatTitleAction })) 