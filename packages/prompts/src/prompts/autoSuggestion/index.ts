import type { ChatMessage } from '@lobechat/types';

export const DEFAULT_AUTO_SUGGESTION =
  'Generate relevant follow-up questions that naturally extend the conversation. Focus on exploring different aspects of the topic, providing actionable next steps, or diving deeper into related areas.';

export interface AutoSuggestionPromptOptions {
  customPrompt?: string;
  maxSuggestions?: number;
  messages: ChatMessage[];
  systemRole?: string;
}

/**
 * Build auto-suggestion prompt based on conversation context
 */
export const autoSuggestionPrompt = (options: AutoSuggestionPromptOptions): string => {
  const { messages, systemRole, customPrompt, maxSuggestions = 3 } = options;

  // Get the last 5 messages for context
  const recentMessages = messages.slice(-5);

  // Build context from recent messages
  const contextMessages = recentMessages
    .map((msg) => {
      const role = msg.role === 'assistant' ? 'Assistant' : 'User';
      return `${role}: ${msg.content}`;
    })
    .join('\n');

  return `Based on this conversation context and the assistant's role, generate ${maxSuggestions} relevant follow-up questions that a user might want to ask next.

${systemRole ? `Assistant Role: ${systemRole}` : ''}

Recent conversation:
${contextMessages}

Generate ${maxSuggestions} concise, relevant questions (each under 60 characters) that naturally follow from the conversation.

${customPrompt ? `Additional guidance: ${customPrompt}` : ''}

Requirements:
- Questions should be specific and actionable
- Avoid generic questions like "What else?" or "Tell me more"
- Focus on exploring different aspects of the topic
- Make questions diverse (not similar to each other)

Return the suggestions in the specified JSON format.`;
};
