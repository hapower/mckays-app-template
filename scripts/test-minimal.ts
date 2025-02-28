/**
 * Minimal test script for checking imports/exports
 * 
 * Run with: npx tsx scripts/test-minimal.ts
 */

console.log('Starting minimal test...')

async function main() {
  try {
    console.log('Attempting to import the module...')
    
    // Try both import styles
    const dynamicImport = await import('../actions/ai-chat-test')
    console.log('Dynamic import succeeded!')
    console.log('Available exports:', Object.keys(dynamicImport))
    
    // Test the functions
    const result1 = await dynamicImport.processChatMessageAction()
    console.log('Function call result:', result1)
    
    const result2 = await dynamicImport.generateChatTitleAction()
    console.log('Function call result:', result2)
    
    console.log('All tests passed!')
  } catch (error) {
    console.error('Error during test:', error)
  }
}

main()
  .then(() => console.log('Test completed'))
  .catch((err) => console.error('Test failed with error:', err)) 