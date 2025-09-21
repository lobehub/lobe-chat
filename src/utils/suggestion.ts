import { z } from 'zod';

import { aiChatService } from '@/services/aiChat';
import { ChatMessage, ChatSuggestion } from '@/types/message';

export interface GenerateSuggestionsOptions {
  /**
   * Custom prompt for generating suggestions
   */
  customPrompt?: string;
  /**
   * Maximum number of suggestions to generate
   * @default 3
   */
  maxSuggestions?: number;
  /**
   * Recent messages for context
   */
  messages: ChatMessage[];
  /**
   * Model to use for generation
   */
  model: string;
  /**
   * Provider to use for generation
   */
  provider: string;
  /**
   * System role of the agent
   */
  systemRole?: string;
}

const SuggestionsSchema = z.object({
  suggestions: z.array(z.string().max(80)).max(5),
});

/**
 * Simple rule-based suggestion generation as fallback
 */
const generateSimpleSuggestions = async (
  content: string,
  maxSuggestions: number,
): Promise<string[]> => {
  const suggestions: string[] = [];

  // Analyze content for common patterns
  if (content.toLowerCase().includes('how') || content.toLowerCase().includes('如何')) {
    suggestions.push('Can you explain this in more detail?');
  }

  if (content.toLowerCase().includes('step') || content.toLowerCase().includes('步骤')) {
    suggestions.push("What's the next step?");
  }

  if (content.toLowerCase().includes('example') || content.toLowerCase().includes('例子')) {
    suggestions.push('Can you show me another example?');
  }

  if (content.toLowerCase().includes('code') || content.toLowerCase().includes('代码')) {
    suggestions.push('How can I modify this code?');
  }

  if (content.toLowerCase().includes('error') || content.toLowerCase().includes('错误')) {
    suggestions.push('How do I fix this issue?');
  }

  // Add generic suggestions if we don't have enough
  const genericSuggestions = [
    'Can you elaborate on this?',
    'What are the alternatives?',
    'Are there any best practices?',
    'What should I avoid?',
    'Can you give me a practical example?',
    "What's the most important thing to remember?",
  ];

  while (suggestions.length < maxSuggestions && genericSuggestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * genericSuggestions.length);
    const suggestion = genericSuggestions.splice(randomIndex, 1)[0];
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, maxSuggestions);
};

/**
 * Generate auto-suggestions based on conversation context
 */
export const generateAutoSuggestions = async (
  options: GenerateSuggestionsOptions,
): Promise<ChatSuggestion[]> => {
  const { messages, systemRole, customPrompt, maxSuggestions = 3, model, provider } = options;

  // Get the last few messages for context
  const recentMessages = messages.slice(-5);
  const lastAssistantMessage = recentMessages.find((msg) => msg.role === 'assistant');

  if (!lastAssistantMessage) {
    return [];
  }

  // Build context from recent messages
  const contextMessages = recentMessages
    .map((msg) => {
      const role = msg.role === 'assistant' ? 'Assistant' : 'User';
      return `${role}: ${msg.content}`;
    })
    .join('\n');

  // Build the prompt for suggestion generation
  const basePrompt = `Based on this conversation context and the assistant's role, generate ${maxSuggestions} relevant follow-up questions that a user might want to ask next.

${systemRole ? `Assistant Role: ${systemRole}` : ''}

Recent conversation:
${contextMessages}

Generate ${maxSuggestions} concise, relevant questions (each under 80 characters) that naturally follow from the conversation.

${customPrompt ? `Additional guidance: ${customPrompt}` : ''}

Return the suggestions in the specified JSON format.`;

  try {
    // Use structured output to generate suggestions
    const abortController = new AbortController();
    const result = await aiChatService.generateJSON(
      {
        messages: [
          {
            content: basePrompt,
            createdAt: Date.now(),
            id: 'temp-suggestion-msg',
            meta: {},
            role: 'user',
            updatedAt: Date.now(),
          } as ChatMessage,
        ],
        model,
        provider,
        schema: SuggestionsSchema,
      },
      abortController,
    );

    // Extract suggestions from the result
    const suggestionsData = result.object as { suggestions: string[] };

    return suggestionsData.suggestions.map((text, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      text,
    }));
  } catch (error) {
    console.error('Error generating suggestions:', error);

    // Fallback to simple suggestion generation
    const fallbackSuggestions = await generateSimpleSuggestions(
      lastAssistantMessage.content,
      maxSuggestions,
    );
    return fallbackSuggestions.map((text, index) => ({
      id: `suggestion-${Date.now()}-${index}`,
      text,
    }));
  }
};
