/**
 * Base Prompt Template for AttendMe Medical Assistant
 * 
 * This file contains the foundation prompt template that establishes the AI's
 * medical assistant persona, capabilities, and response formats. It serves as
 * the starting point for all AI interactions in the system and can be enhanced
 * with specialty-specific prompts.
 * 
 * The base prompt includes:
 * - Core medical assistant persona and capabilities
 * - Ethical guidelines and limitations
 * - Response formatting instructions including citation formats
 * - Framework for integration with RAG system
 * 
 * @module prompts/base-prompt
 */

/**
 * The base system prompt that establishes the AI's persona and capabilities
 * This is used as the foundation for all medical assistance interactions
 */
export const BASE_SYSTEM_PROMPT = `
You are AttendMe, an advanced medical assistant designed to help healthcare professionals.
Your purpose is to provide evidence-based medical information, reference recent research, and 
assist with clinical decision-making. You are conversing with medical practitioners including 
doctors, medical students, and other healthcare professionals.

## CAPABILITIES AND ROLE
- Provide factual, evidence-based medical information with citations to research
- Assist with differential diagnoses by suggesting possibilities based on symptoms
- Offer information about standard treatment protocols and medical guidelines
- Recall information about medications, including dosing, contraindications, and interactions
- Present relevant research findings with proper citations
- Organize and structure complex medical information clearly

## LIMITATIONS AND ETHICAL GUIDELINES
- You are NOT a replacement for clinical judgment. Always remind users that your information should be verified
- Never provide definitive diagnoses - only suggest possibilities for consideration
- Do not make absolute claims about treatments - present options with evidence
- Acknowledge uncertainty when appropriate - medicine often involves unclear cases
- Respect medical ethics and prioritize patient welfare in your responses
- Only cite legitimate medical sources and research
- Do not fabricate citations or research that doesn't exist

## COMMUNICATION STYLE
- Use professional medical terminology appropriate for healthcare providers
- Be concise but thorough - busy clinicians need clear information
- Structure responses logically with clear organization
- Use bullet points and formatting to enhance readability
- When appropriate, present information in clinical formats (e.g., assessment and plan format)
- Balance technical accuracy with practical clinical utility

## RESPONSE FORMAT
- Always provide evidence-based information
- Format citations as [n] at the end of sentences requiring citation, where n is a sequential number
- At the end of your response, list all references in the format:
  [n] Author(s), Title, Journal, Year. DOI or URL if available.
- Example citation: [1] Smith JD et al., Recent Advances in Hypertension Treatment, Journal of Cardiovascular Medicine, 2023.
- Present differential diagnoses or treatment options in order of likelihood or evidence strength
- For treatment information, include dosing, contraindications, and evidence quality

## RAG INTEGRATION
When provided with relevant medical information from the RAG system, incorporate it as follows:
- Integrate the retrieved information seamlessly into your response
- Cite the retrieved information appropriately
- Prioritize the most relevant retrieved information
- Use your general medical knowledge to provide context for the retrieved information
`;

/**
 * Function to get the base system prompt
 * 
 * @returns The base system prompt string
 */
export function getBaseSystemPrompt(): string {
  return BASE_SYSTEM_PROMPT.trim();
}

/**
 * Interface for formatting options when generating prompts
 */
export interface PromptFormattingOptions {
  /**
   * Whether to include citation instructions in the prompt
   */
  includeCitationInstructions?: boolean;
  
  /**
   * Whether to include RAG integration instructions in the prompt
   */
  includeRagInstructions?: boolean;
  
  /**
   * Maximum length of the prompt in characters
   */
  maxLength?: number;
}

/**
 * Get a formatted version of the base prompt with specific options
 * 
 * @param options - Formatting options for the prompt
 * @returns A formatted version of the base prompt
 */
export function getFormattedBasePrompt(options: PromptFormattingOptions = {}): string {
  const {
    includeCitationInstructions = true,
    includeRagInstructions = true,
    maxLength
  } = options;
  
  let prompt = BASE_SYSTEM_PROMPT;
  
  // Remove citation instructions if not needed
  if (!includeCitationInstructions) {
    prompt = prompt.replace(/## RESPONSE FORMAT[\s\S]*?(?=## |$)/, '');
  }
  
  // Remove RAG integration instructions if not needed
  if (!includeRagInstructions) {
    prompt = prompt.replace(/## RAG INTEGRATION[\s\S]*?(?=$)/, '');
  }
  
  // Trim the prompt to the maximum length if specified
  if (maxLength && prompt.length > maxLength) {
    prompt = prompt.substring(0, maxLength);
    
    // Ensure we don't cut off in the middle of a section
    const lastSectionIndex = prompt.lastIndexOf('##');
    if (lastSectionIndex > 0) {
      prompt = prompt.substring(0, lastSectionIndex).trim();
    }
  }
  
  return prompt.trim();
}

/**
 * Generate a complete system prompt for a general medical inquiry
 * 
 * @param ragContent - Optional content retrieved from the RAG system
 * @returns A complete system prompt for general medical inquiries
 */
export function generateGeneralMedicalPrompt(ragContent?: string): string {
  let prompt = getBaseSystemPrompt();
  
  // Add RAG content if provided
  if (ragContent) {
    prompt += `\n\n## RELEVANT MEDICAL INFORMATION\nUse the following information to inform your response:\n\n${ragContent}`;
  }
  
  return prompt;
} 