/**
 * Test script for AI chat actions
 * 
 * This script tests the AI chat processing actions to ensure they work correctly.
 * It can be used to test the RAG system and OpenAI integration.
 * 
 * To run this script:
 * 1. Make sure your .env.local file contains the required API keys and database connection
 * 2. Run: npx tsx scripts/test-ai-chat.ts
 */

// Using dynamic import for better ESM compatibility
async function main() {
  console.log('Testing AI Chat Actions...')
  
  // Test user ID (replace with a real user ID from your database)
  const testUserId = 'test-user-123'
  
  // Test specialty ID (replace with a real specialty ID from your database)
  // Leave empty to test without a specialty
  const testSpecialtyId = undefined // 'cardiology-specialty-id'
  
  // Test message
  const testMessage = 'What are the latest guidelines for managing hypertension?'
  
  console.log(`Processing message: "${testMessage}"`)
  
  try {
    // Dynamically import the module
    const aiChatActions = await import('../actions/ai-chat-actions')
    
    // Test processing a chat message
    const result = await aiChatActions.processChatMessageAction({
      message: testMessage,
      userId: testUserId,
      specialtyId: testSpecialtyId
    })
    
    if (result.isSuccess) {
      console.log('\n✅ Message processed successfully!')
      console.log('\nAI Response:')
      console.log(result.data.message.content)
      
      if (result.data.citations && result.data.citations.length > 0) {
        console.log('\nCitations:')
        result.data.citations.forEach((citation: any) => {
          // Use type assertion to access the referenceNumber property which might be added at runtime
          const citationWithRef = citation as (typeof citation & { referenceNumber?: number })
          console.log(`- [${citationWithRef.referenceNumber || '?'}] ${citation.title || ''} ${citation.authors || ''} ${citation.journal || ''} ${citation.year || ''}`)
        })
      } else {
        console.log('\nNo citations found in the response')
      }
      
      // Test generating a chat title
      const titleResult = await aiChatActions.generateChatTitleAction(testMessage)
      
      if (titleResult.isSuccess) {
        console.log(`\nGenerated chat title: "${titleResult.data}"`)
      } else {
        console.error(`\n❌ Failed to generate chat title: ${titleResult.message}`)
      }
    } else {
      console.error(`\n❌ Failed to process message: ${result.message}`)
    }
  } catch (error) {
    console.error('\n❌ Error running test:', error)
  }
}

main()
  .then(() => console.log('\nTest completed'))
  .catch(err => console.error('\nTest failed with error:', err))
  .finally(() => process.exit()) 