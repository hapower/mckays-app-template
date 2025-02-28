/**
 * Simple script to check exports from the AI chat actions module
 * 
 * Run with: node scripts/check-exports.mjs
 */

import * as aiChatActions from '../actions/ai-chat-actions.js';

try {
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
  console.error('Error processing the module:');
  console.error(error);
} 