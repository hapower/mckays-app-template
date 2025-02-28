/**
 * Simple script to check exports from the AI chat actions module
 * 
 * Run with: node scripts/check-exports.js
 */

try {
  // Try to require the module
  const aiChatActions = require('../actions/ai-chat-actions');
  
  console.log('Successfully imported the module!');
  console.log('Available exports:');
  console.log(Object.keys(aiChatActions));
  
  // Check if specific functions exist
  const functionNames = [
    'processChatMessageAction',
    'streamChatMessageAction',
    'generateChatTitleAction'
  ];
  
  functionNames.forEach(name => {
    if (name in aiChatActions) {
      console.log(`✅ ${name} is exported and available`);
    } else {
      console.log(`❌ ${name} is NOT found in exports`);
    }
  });
} catch (error) {
  console.error('Error importing the module:');
  console.error(error);
} 